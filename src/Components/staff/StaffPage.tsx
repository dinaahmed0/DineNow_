import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaCalendarCheck,
  FaCheck,
  FaQrcode,
  FaSpinner,
  FaLightbulb,
  FaTimes,
  FaChair,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import {
  approveReservation,
  checkInReservation,
  completeReservation,
  getAllStaffReservations,
  getReservationSuggestions,
  rejectReservation,
} from '../../services/reservation';
import { getAvailableTables } from '../../services/table';
import { getRestaurantById } from '../../services/restaurant';
import { resolveRestaurantId } from '../../lib/resolve-restaurant-id';
import { sortStaffReservationsByPriority } from '../../lib/reservation-status';
import type { ReservationStaffItem } from '../../types/reservation';
import type { TableItem } from '../../types/table';
import {
  formatStatusLabel,
  matchesStatusGroup,
  normalizeReservationStatus,
  STATUS_GROUPS,
} from '../../lib/reservation-status';
import DashboardShell, { StatCard } from '../dashboard/DashboardShell';
import { APP_ROUTES } from '../../constants/routes';

type FilterTab = 'pending' | 'active' | 'done';

const getStatusBadgeClass = (status: string | number) => {
  const s = normalizeReservationStatus(status);
  if (matchesStatusGroup(STATUS_GROUPS.active, status)) return 'bg-green-100 text-green-700';
  if (matchesStatusGroup(STATUS_GROUPS.pending, status)) return 'bg-yellow-100 text-yellow-700';
  if (s === 'rejected') return 'bg-red-100 text-red-700';
  if (s === 'cancelled') return 'bg-blue-100 text-blue-700';
  return 'bg-gray-100 text-gray-600';
};

export default function StaffPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationStaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [actionId, setActionId] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);

  const [suggestionsForReservationId, setSuggestionsForReservationId] = useState<number | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<import('../../types/reservation').ReservationSuggestion[]>([]);

  // Table picker for approval
  const [pickerReservation, setPickerReservation] = useState<ReservationStaffItem | null>(null);
  const [pickerTables, setPickerTables] = useState<TableItem[]>([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [pickerError, setPickerError] = useState<string | null>(null);
  const [pickerSelected, setPickerSelected] = useState<number | null>(null);
  const [pickerConfirming, setPickerConfirming] = useState(false);

  const pushToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') console.error(text);
  };

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAllStaffReservations({ pageIndex: 0, pageSize: 100 });
      if (!response.succeeded) {
        throw new Error(response.message || 'Failed to load reservations');
      }
      const items = response.data?.data ?? [];
      setReservations(sortStaffReservationsByPriority(items));
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to load reservations', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!user?.token) return;
    void (async () => {
      try {
        const rid = await resolveRestaurantId(user.token);
        if (!rid) return;
        const r = await getRestaurantById(rid);
        if (r?.name) setRestaurantName(r.name);
      } catch {
        // non-critical
      }
    })();
  }, [user?.token]);

  useEffect(() => {
    const interval = setInterval(() => {
      void load();
    }, 20_000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = reservations.filter((r) => {
    const s = normalizeReservationStatus(r.status);
    if (filter === 'pending') return STATUS_GROUPS.pending.includes(s as 'pending');
    if (filter === 'active') return STATUS_GROUPS.active.includes(s as 'approved');
    return s === 'completed' || STATUS_GROUPS.inactive.includes(s as 'rejected');
  });

  const pendingCount = reservations.filter((r) =>
    matchesStatusGroup(STATUS_GROUPS.pending, r.status)
  ).length;
  const activeCount = reservations.filter((r) =>
    matchesStatusGroup(STATUS_GROUPS.active, r.status)
  ).length;

  const runAction = async (id: number, action: 'reject' | 'complete') => {
    setActionId(id);
    try {
      if (action === 'reject') await rejectReservation(id);
      else await completeReservation(id);
      pushToast(`Reservation ${action}d successfully`);
      await load();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setActionId(null);
    }
  };

  const openTablePicker = async (reservation: ReservationStaffItem) => {
    setPickerReservation(reservation);
    setPickerSelected(null);
    setPickerError(null);
    setPickerTables([]);
    setPickerLoading(true);
    try {
      const res = await getAvailableTables({
        guests: reservation.numberOfGuests,
        start: reservation.startDateTime,
        end: reservation.endDateTime,
        pageSize: 50,
      });
      setPickerTables(res.data?.data ?? []);
    } catch {
      setPickerError('Could not load available tables');
    } finally {
      setPickerLoading(false);
    }
  };

  const closeTablePicker = () => {
    setPickerReservation(null);
    setPickerTables([]);
    setPickerSelected(null);
    setPickerError(null);
  };

  const confirmApprove = async () => {
    if (!pickerReservation || pickerSelected === null) return;
    setPickerConfirming(true);
    try {
      await approveReservation(pickerReservation.id);
      closeTablePicker();
      await load();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Approval failed', 'error');
    } finally {
      setPickerConfirming(false);
    }
  };

  const handleCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode.trim()) return;
    setCheckInLoading(true);
    try {
      const response = await checkInReservation(qrCode.trim());
      if (!response.succeeded) {
        throw new Error(response.message || 'Check-in failed');
      }
      pushToast(response.message || 'Guest checked in successfully');
      setQrCode('');
      await load();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Check-in failed', 'error');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleLogout = () => {
    navigate(APP_ROUTES.logout);
  };

  const loadSuggestions = async (reservationId: number) => {
    if (suggestionsForReservationId === reservationId) {
      setSuggestionsForReservationId(null);
      setSuggestions([]);
      setSuggestionsError(null);
      return;
    }
    setSuggestionsForReservationId(reservationId);
    setSuggestionsLoading(true);
    setSuggestionsError(null);
    setSuggestions([]);
    try {
      const res = await getReservationSuggestions(reservationId);
      if (!res.succeeded) throw new Error(res.message || 'Failed to load suggestions');
      setSuggestions(res.data ?? []);
    } catch (err) {
      setSuggestionsError(err instanceof Error ? err.message : 'Failed to load suggestions');
    } finally {
      setSuggestionsLoading(false);
    }
  };

  return (
    <>
      <DashboardShell
        badge="Staff"
        title={restaurantName ?? 'Reservations desk'}
        subtitle="New guest requests appear as pending — approve to confirm their table"
        userName={user?.displayName}
        onLogout={handleLogout}
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Pending" value={pendingCount} icon={<FaCalendarCheck />} accent="amber" />
          <StatCard label="Active" value={activeCount} icon={<FaCheck />} accent="emerald" />
          <StatCard label="Total loaded" value={reservations.length} icon={<FaCalendarCheck />} accent="blue" />
        </div>

        <form
          onSubmit={handleCheckIn}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <FaQrcode className="text-[#6B8A62]" />
            QR check-in
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            Scan or paste the guest QR code to check them in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="Paste QR code value..."
              className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62]"
            />
            <button
              type="submit"
              disabled={checkInLoading || !qrCode.trim()}
              className="px-6 py-2.5 bg-[#6B8A62] text-white rounded-xl text-sm font-medium hover:bg-[#5A7352] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {checkInLoading ? <FaSpinner className="animate-spin" /> : <FaCheck />}
              Check in
            </button>
          </div>
        </form>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex border-b border-gray-100">
            {(
              [
                ['pending', 'Pending'],
                ['active', 'Active'],
                ['done', 'Completed / closed'],
              ] as const
            ).map(([tab, label]) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilter(tab)}
                className={`flex-1 py-3 text-sm font-medium transition ${
                  filter === tab
                    ? 'border-b-2 border-[#6B8A62] text-[#6B8A62]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <div className="p-4 space-y-3 max-h-[520px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center py-12">
                <FaSpinner className="animate-spin text-3xl text-[#6B8A62]" />
              </div>
            ) : filtered.length === 0 ? (
              <p className="text-center text-gray-400 py-12">No reservations in this view</p>
            ) : (
              filtered.map((r) => {
                const pending = matchesStatusGroup(STATUS_GROUPS.pending, r.status);
                const active = matchesStatusGroup(STATUS_GROUPS.active, r.status);
                return (
                  <div
                    key={r.id}
                    className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition"
                  >
                    <div className="flex flex-wrap justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-gray-900">{r.userName}</p>
                        <p className="text-sm text-gray-500">
                          {r.tableNumber ? `Table ${r.tableNumber}` : 'No table yet'} · {r.numberOfGuests} guests
                        </p>
                      </div>
                      <span className={`inline-flex items-center justify-center text-xs font-medium px-2 py-1 rounded-full capitalize ${getStatusBadgeClass(r.status)}`}>
                        {formatStatusLabel(r.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      {new Date(r.startDateTime).toLocaleString()} –{' '}
                      {new Date(r.endDateTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {r.notes && <p className="text-xs text-gray-500 mb-3">Notes: {r.notes}</p>}
                    <div className="flex flex-wrap gap-2">
                      {pending && (
                        <>
                          <button
                            type="button"
                            onClick={() => void openTablePicker(r)}
                            className="px-3 py-1.5 bg-[#6B8A62] text-white text-sm rounded-lg hover:bg-[#5A7352]"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionId === r.id}
                            onClick={() => void runAction(r.id, 'reject')}
                            className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {active && (
                        <button
                          type="button"
                          disabled={actionId === r.id}
                          onClick={() => void runAction(r.id, 'complete')}
                          className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg disabled:opacity-50"
                        >
                          Mark complete
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => void loadSuggestions(r.id)}
                        className={`px-3 py-1.5 border text-sm rounded-lg transition-colors ${
                          suggestionsForReservationId === r.id
                            ? 'border-[#6B8A62] text-[#6B8A62] bg-[#6B8A62]/10'
                            : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                        disabled={suggestionsLoading}
                      >
                        <span className="inline-flex items-center gap-2">
                          <FaLightbulb className="text-[#6B8A62]" />
                          {suggestionsForReservationId === r.id ? 'Hide suggestions' : 'View suggestions'}
                        </span>
                      </button>
                    </div>

                    {suggestionsForReservationId === r.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center justify-between gap-4">
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <FaLightbulb className="text-[#6B8A62]" />
                            Suggested slots
                          </p>
                          {suggestionsLoading && (
                            <FaSpinner className="animate-spin text-[#6B8A62]" />
                          )}
                        </div>
                        {suggestionsError && (
                          <p className="mt-3 text-sm text-red-600">{suggestionsError}</p>
                        )}
                        {!suggestionsLoading && !suggestionsError && suggestions.length === 0 && (
                          <p className="mt-3 text-sm text-gray-500">No suggestions available.</p>
                        )}
                        {!suggestionsLoading && suggestions.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {suggestions.map((s) => (
                              <div
                                key={s.suggestionId}
                                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-white border border-gray-100 rounded-lg"
                              >
                                <div>
                                  <p className="text-sm font-semibold text-gray-900">
                                    Table {s.tableNumber}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(s.startTime).toLocaleString()} – {new Date(s.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-700">
                                  Expires: {new Date(s.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DashboardShell>

      {/* Table picker modal */}
      {pickerReservation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-start justify-between p-5 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Assign a table</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {pickerReservation.userName} · {pickerReservation.numberOfGuests} guests ·{' '}
                  {new Date(pickerReservation.startDateTime).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <button
                type="button"
                onClick={closeTablePicker}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
              >
                <FaTimes />
              </button>
            </div>

            {/* Table list */}
            <div className="flex-1 overflow-y-auto p-5">
              {pickerLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3">
                  <FaSpinner className="animate-spin text-2xl text-[#6B8A62]" />
                  <p className="text-sm text-gray-500">Loading available tables…</p>
                </div>
              ) : pickerError ? (
                <p className="text-sm text-red-600 text-center py-8">{pickerError}</p>
              ) : pickerTables.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No tables available for this time slot and party size.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {pickerTables.map((t) => (
                    <button
                      key={t.tableNumber}
                      type="button"
                      onClick={() => setPickerSelected(t.tableNumber)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition ${
                        pickerSelected === t.tableNumber
                          ? 'border-[#6B8A62] bg-[#6B8A62]/5 text-[#6B8A62]'
                          : 'border-gray-100 hover:border-gray-200 text-gray-700'
                      }`}
                    >
                      <FaChair className="text-xl" />
                      <span className="text-sm font-semibold">Table {t.tableNumber}</span>
                      <span className="text-xs text-gray-500">Up to {t.capacity} guests</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-5 border-t border-gray-100">
              <button
                type="button"
                onClick={closeTablePicker}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 text-sm rounded-xl hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={pickerSelected === null || pickerConfirming}
                onClick={() => void confirmApprove()}
                className="flex-1 py-2.5 bg-[#6B8A62] text-white text-sm font-medium rounded-xl hover:bg-[#5A7352] disabled:opacity-50 flex items-center justify-center gap-2 transition"
              >
                {pickerConfirming ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                Confirm approval
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
