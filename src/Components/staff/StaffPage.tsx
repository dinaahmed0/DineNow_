import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarCheck,
  FaCheck,
  FaQrcode,
  FaSpinner,
  FaLightbulb,
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
import { sortStaffReservationsByPriority } from '../../lib/reservation-status';
import type { ReservationStaffItem } from '../../types/reservation';
import {
  formatStatusLabel,
  matchesStatusGroup,
  normalizeReservationStatus,
  STATUS_GROUPS,
} from '../../lib/reservation-status';
import DashboardShell, { StatCard } from '../dashboard/DashboardShell';
import { APP_ROUTES } from '../../constants/routes';

type FilterTab = 'pending' | 'active' | 'done';

export default function StaffPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservations, setReservations] = useState<ReservationStaffItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>('pending');
  const [actionId, setActionId] = useState<number | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [checkInLoading, setCheckInLoading] = useState(false);

  const [suggestionsForReservationId, setSuggestionsForReservationId] = useState<number | null>(null);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<import('../../types/reservation').ReservationSuggestion[]>([]);

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
    const interval = setInterval(() => {
      void load();
    }, 20_000);
    return () => clearInterval(interval);
  }, [load]);

  const filtered = reservations.filter((r) => {
    const s = normalizeReservationStatus(r.status);
    if (filter === 'pending') return STATUS_GROUPS.pending.includes(s as 'pending');
    if (filter === 'active') return STATUS_GROUPS.active.includes(s as 'approved');
    return (
      s === 'completed' ||
      STATUS_GROUPS.inactive.includes(s as 'rejected')
    );
  });

  const pendingCount = reservations.filter((r) =>
    matchesStatusGroup(STATUS_GROUPS.pending, r.status)
  ).length;
  const activeCount = reservations.filter((r) =>
    matchesStatusGroup(STATUS_GROUPS.active, r.status)
  ).length;

  const runAction = async (id: number, action: 'approve' | 'reject' | 'complete') => {
    setActionId(id);
    try {
      if (action === 'approve') await approveReservation(id);
      else if (action === 'reject') await rejectReservation(id);
      else await completeReservation(id);
      pushToast(`Reservation ${action}d successfully`);
      await load();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setActionId(null);
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
    // Route through the centralized logout screen so history/back cannot restore the session.
    navigate(APP_ROUTES.logout);
  };

  const loadSuggestions = async (reservationId: number) => {
    if (suggestionsForReservationId === reservationId) {
      // toggle off
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
      if (!res.succeeded) {
        throw new Error(res.message || 'Failed to load suggestions');
      }
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
        title="Reservations desk"
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
            Scan or paste the guest QR code to check them in (POST /api/Reservation/check-in).
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
                          Table {r.tableNumber || '—'} · {r.numberOfGuests} guests
                        </p>
                      </div>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 capitalize">
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
                            disabled={actionId === r.id}
                            onClick={() => runAction(r.id, 'approve')}
                            className="px-3 py-1.5 bg-[#6B8A62] text-white text-sm rounded-lg disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            disabled={actionId === r.id}
                            onClick={() => runAction(r.id, 'reject')}
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
                          onClick={() => runAction(r.id, 'complete')}
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
    </>
  );
}
