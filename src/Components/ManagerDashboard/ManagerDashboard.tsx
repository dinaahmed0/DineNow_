import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaUsers,
  FaClock,
  FaCheckCircle,
  FaUserPlus,
  FaTrashAlt,
  FaCalendarAlt,
  FaChair,
  FaInbox,
  FaPaperPlane,
  FaTimes,
  FaSpinner,
  FaUtensils,
  FaEdit,
  FaClipboardList,
  FaPlus,
  FaSave,
  FaImage,
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { getRestaurantById } from '../../services/restaurant';
import {
  approveReservation,
  completeReservation,
  getAllStaffReservations,
  rejectReservation,
} from '../../services/reservation';
import {
  blockStaffMember,
  getStaffMembers,
  inviteStaff,
} from '../../services/auth';
import { createTable, deleteTable, getTables, updateTable } from '../../services/table';
import {
  createCategory,
  createMenuItem,
  deleteCategory,
  deleteMenuItem,
  getCategories,
  getMenuItemsByCategory,
  updateCategory,
  updateMenuItem,
} from '../../services/menu';
import type { ReservationStaffItem } from '../../types/reservation';
import type { StaffMember } from '../../types/auth';
import type { TableItem } from '../../types/table';
import type { ReturnRestaurantQuery } from '../../types/restaurant';
import type { MenuCategory, MenuItem } from '../../types/menu';
import { resolveRestaurantId } from '../../lib/resolve-restaurant-id';
import {
  formatStatusLabel,
  matchesStatusGroup,
  normalizeReservationStatus,
  sortStaffReservationsByPriority,
  STATUS_GROUPS,
} from '../../lib/reservation-status';

const getReservationStatusStyles = (status: string | number) => {
  const normalized = normalizeReservationStatus(status);
  if (matchesStatusGroup(STATUS_GROUPS.active, status)) {
    return { badge: 'bg-green-100 text-green-700', border: 'border-l-green-500' };
  }
  if (matchesStatusGroup(STATUS_GROUPS.pending, status)) {
    return { badge: 'bg-yellow-100 text-yellow-700', border: 'border-l-yellow-500' };
  }
  if (normalized === 'rejected') {
    return { badge: 'bg-red-100 text-red-700', border: 'border-l-red-500' };
  }
  if (normalized === 'cancelled') {
    return { badge: 'bg-blue-100 text-blue-700', border: 'border-l-blue-500' };
  }
  return { badge: 'bg-gray-100 text-gray-500', border: 'border-l-gray-300' };
};

const getInitials = (name?: string) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : parts[0].slice(0, 2);
  return initials.toUpperCase();
};
import DashboardShell, { StatCard } from '../dashboard/DashboardShell';
import { APP_ROUTES } from '../../constants/routes';

type TabKey = 'pending' | 'active' | 'completed' | 'inactive';
type Section = 'reservations' | 'staff' | 'tables' | 'menu';

export default function ManagerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [restaurantId, setRestaurantId] = useState<number | null>(null);
  const [restaurant, setRestaurant] = useState<ReturnRestaurantQuery | null>(null);
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [reservations, setReservations] = useState<ReservationStaffItem[]>([]);
  const [tables, setTables] = useState<TableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [section, setSection] = useState<Section>('reservations');
  const [resTab, setResTab] = useState<TabKey>('pending');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<number | null>(null);
  const [newTable, setNewTable] = useState({ tableNumber: '', capacity: '' });
  const [editingTableNum, setEditingTableNum] = useState<number | null>(null);
  const [editCapacity, setEditCapacity] = useState('');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItemsByCategory, setMenuItemsByCategory] = useState<Record<number, MenuItem[]>>({});
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [newMenuItem, setNewMenuItem] = useState<
    Record<number, { name: string; description: string; price: string; image: File | null }>
  >({});
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [editItem, setEditItem] = useState<{ name: string; description: string; price: string; image: File | null }>({
    name: '',
    description: '',
    price: '',
    image: null,
  });

  const pushToast = (text: string, type: 'success' | 'error' = 'success') => {
    if (type === 'error') console.error(text);
  };

  const fetchStaff = useCallback(async () => {
    try {
      const response = await getStaffMembers();
      if (response.succeeded && response.data) {
        setStaffList(response.data);
      } else {
        setStaffList([]);
      }
    } catch {
      // Backend returns 404 when no staff exist yet — treat as empty list
      setStaffList([]);
    }
  }, []);

  const fetchReservations = useCallback(async () => {
    try {
      const response = await getAllStaffReservations({ pageIndex: 0, pageSize: 100 });
      if (response.succeeded && response.data) {
        const items = response.data.data ?? [];
        setReservations(sortStaffReservationsByPriority(items));
      }
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to load reservations', 'error');
    }
  }, []);

  const fetchTables = useCallback(async () => {
    const response = await getTables({ pageIndex: 0, pageSize: 100 });
    if (response.succeeded && response.data) {
      setTables(response.data.data ?? []);
    }
  }, []);

  const fetchMenu = useCallback(async (rid: number | null) => {
    const catResponse = await getCategories(rid ?? undefined);
    if (!catResponse.succeeded) return;
    const cats = catResponse.data ?? [];
    setCategories(cats);
    const entries = await Promise.all(
      cats.map(async (c) => {
        const itemsResponse = await getMenuItemsByCategory(c.id);
        return [c.id, itemsResponse.succeeded ? itemsResponse.data ?? [] : []] as const;
      })
    );
    setMenuItemsByCategory(Object.fromEntries(entries));
  }, []);

  const loadAll = useCallback(async () => {
    if (!user?.token) return;
    setLoading(true);
    try {
      const rid = await resolveRestaurantId(user.token);
      setRestaurantId(rid);
      if (rid) {
        localStorage.setItem('restaurantId', String(rid));
        const r = await getRestaurantById(rid);
        setRestaurant(r);
      }
      await Promise.all([fetchStaff(), fetchReservations(), fetchTables(), fetchMenu(rid)]);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to load dashboard', 'error');
    } finally {
      setLoading(false);
    }
  }, [user?.token, fetchStaff, fetchReservations, fetchTables, fetchMenu]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (section !== 'reservations') return;
    const interval = setInterval(() => {
      void fetchReservations();
    }, 20_000);
    return () => clearInterval(interval);
  }, [section, fetchReservations]);

  const today = new Date().toISOString().slice(0, 10);
  const pendingCount = reservations.filter((r) =>
    matchesStatusGroup(STATUS_GROUPS.pending, r.status)
  ).length;
  const confirmedToday = reservations.filter((r) => {
    const day = r.startDateTime?.slice(0, 10);
    return day === today && matchesStatusGroup(STATUS_GROUPS.active, r.status);
  }).length;

  const filteredReservations = reservations.filter((r) => {
    const normalized = normalizeReservationStatus(r.status);
    if (resTab === 'pending') return STATUS_GROUPS.pending.includes(normalized as 'pending');
    if (resTab === 'active') return STATUS_GROUPS.active.includes(normalized as 'approved');
    if (resTab === 'completed') return normalized === 'completed';
    return STATUS_GROUPS.inactive.includes(normalized as 'rejected');
  });

  const runReservationAction = async (
    id: number,
    action: 'approve' | 'reject' | 'complete'
  ) => {
    setActionId(id);
    try {
      if (action === 'approve') await approveReservation(id);
      else if (action === 'reject') await rejectReservation(id);
      else await completeReservation(id);
      pushToast(`Reservation ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed'}`);
      await fetchReservations();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Action failed', 'error');
    } finally {
      setActionId(null);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSubmitting(true);
    try {
      const response = await inviteStaff({ email: inviteEmail.trim() });
      if (!response.succeeded) {
        throw new Error(response.message || 'Invite failed');
      }
      pushToast(`Invitation sent to ${inviteEmail}`);
      setShowInviteModal(false);
      setInviteEmail('');
      await fetchStaff();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to invite staff', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBlockStaff = async (member: StaffMember) => {
    const staffId = member.email ?? member.userName ?? '';
    if (!staffId) return;
    if (!window.confirm(`Block staff member ${member.displayName ?? member.email}?`)) return;
    try {
      const response = await blockStaffMember({ staffId });
      if (!response.succeeded) {
        throw new Error(response.message || 'Failed to block staff');
      }
      pushToast(`${member.displayName ?? member.email ?? 'Staff member'} has been blocked`);
      await fetchStaff();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to block staff', 'error');
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    const tableNumber = Number(newTable.tableNumber);
    const capacity = Number(newTable.capacity);
    if (!tableNumber || !capacity) {
      pushToast('Enter table number and capacity', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const response = await createTable({ tableNumber, capacity });
      if (!response.succeeded) {
        throw new Error(response.message || 'Failed to add table');
      }
      pushToast(`Table #${tableNumber} added`);
      setNewTable({ tableNumber: '', capacity: '' });
      await fetchTables();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to add table', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditTable = async (tableNum: number) => {
    const capacity = Number(editCapacity);
    if (!capacity || capacity < 1) {
      pushToast('Enter a valid capacity', 'error');
      return;
    }
    try {
      const response = await updateTable({ tableNumber: tableNum, capacity });
      if (!response.succeeded) throw new Error(response.message || 'Update failed');
      pushToast(`Table #${tableNum} updated`);
      setEditingTableNum(null);
      setEditCapacity('');
      await fetchTables();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to update table', 'error');
    }
  };

  const handleDeleteTable = async (tableNum: number) => {
    if (!window.confirm(`Delete table #${tableNum}?`)) return;
    try {
      const response = await deleteTable(tableNum);
      if (!response.succeeded) {
        throw new Error(response.message || 'Failed to delete table');
      }
      pushToast(`Table #${tableNum} removed`);
      await fetchTables();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to delete table', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      pushToast('Enter a category name', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const response = await createCategory({ name: newCategoryName.trim() });
      if (!response.succeeded) throw new Error(response.message || 'Failed to add category');
      pushToast(`Category "${newCategoryName.trim()}" added`);
      setNewCategoryName('');
      await fetchMenu(restaurantId);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to add category', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: number) => {
    if (!editCategoryName.trim()) {
      pushToast('Enter a category name', 'error');
      return;
    }
    try {
      const response = await updateCategory({ id, name: editCategoryName.trim() });
      if (!response.succeeded) throw new Error(response.message || 'Update failed');
      pushToast('Category updated');
      setEditingCategoryId(null);
      setEditCategoryName('');
      await fetchMenu(restaurantId);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to update category', 'error');
    }
  };

  const handleDeleteCategory = async (category: MenuCategory) => {
    if (!window.confirm(`Delete category "${category.name}"? This will also remove its menu items.`)) return;
    try {
      const response = await deleteCategory(category.id);
      if (!response.succeeded) throw new Error(response.message || 'Failed to delete category');
      pushToast(`Category "${category.name}" removed`);
      await fetchMenu(restaurantId);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to delete category', 'error');
    }
  };

  const handleAddMenuItem = async (e: React.FormEvent, categoryId: number) => {
    e.preventDefault();
    const draft = newMenuItem[categoryId] ?? { name: '', description: '', price: '', image: null };
    const price = Number(draft.price);
    if (!draft.name.trim() || !price || price <= 0) {
      pushToast('Enter item name and a valid price', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const response = await createMenuItem({
        name: draft.name.trim(),
        description: draft.description.trim(),
        price,
        categoryId,
        image: draft.image,
      });
      if (!response.succeeded) throw new Error(response.message || 'Failed to add item');
      pushToast(`"${draft.name.trim()}" added`);
      setNewMenuItem((prev) => ({ ...prev, [categoryId]: { name: '', description: '', price: '', image: null } }));
      await fetchMenu(restaurantId);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to add item', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateMenuItem = async (id: number) => {
    const price = Number(editItem.price);
    if (!editItem.name.trim() || !price || price <= 0) {
      pushToast('Enter item name and a valid price', 'error');
      return;
    }
    try {
      const response = await updateMenuItem({
        id,
        name: editItem.name.trim(),
        description: editItem.description.trim(),
        price,
        image: editItem.image,
      });
      if (!response.succeeded) throw new Error(response.message || 'Update failed');
      pushToast('Item updated');
      setEditingItemId(null);
      setEditItem({ name: '', description: '', price: '', image: null });
      await fetchMenu(restaurantId);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to update item', 'error');
    }
  };

  const handleDeleteMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Delete "${item.name}"?`)) return;
    try {
      const response = await deleteMenuItem(item.id);
      if (!response.succeeded) throw new Error(response.message || 'Failed to delete item');
      pushToast(`"${item.name}" removed`);
      await fetchMenu(restaurantId);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to delete item', 'error');
    }
  };

  const handleLogout = () => {
    // Route through the centralized logout screen so history/back cannot restore the session.
    navigate(APP_ROUTES.logout);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <FaSpinner className="animate-spin text-4xl text-[#6B8A62]" />
      </div>
    );
  }

  return (
    <>
      <DashboardShell
        badge="Manager"
        title="Restaurant dashboard"
        subtitle={
          restaurant
            ? `${restaurant.name} · reservations, staff & tables`
            : 'Manage your venue operations'
        }
        userName={user?.displayName}
        onLogout={handleLogout}
      >
        {!restaurantId && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            Could not detect your restaurant ID from the session. Some features may still work if your
            account is scoped on the server.
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <StatCard
            label="Pending requests"
            value={pendingCount}
            icon={<FaClock />}
            accent="amber"
          />
          <StatCard
            label="Active today"
            value={confirmedToday}
            icon={<FaCheckCircle />}
            accent="emerald"
          />
          <StatCard label="Staff members" value={staffList.length} icon={<FaUsers />} accent="blue" />
          <StatCard label="Tables" value={tables.length} icon={<FaChair />} accent="rose" />
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {(
            [
              ['reservations', 'Reservations', FaCalendarAlt, pendingCount],
              ['staff', 'Staff team', FaUsers, 0],
              ['tables', 'Tables', FaUtensils, 0],
              ['menu', 'Menu', FaClipboardList, 0],
            ] as const
          ).map(([key, label, Icon, badge]) => (
            <button
              key={key}
              type="button"
              onClick={() => setSection(key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition ${
                section === key
                  ? 'bg-[#6B8A62] text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Icon />
              {label}
              {badge > 0 && (
                <span
                  className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                    section === key ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {section === 'reservations' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex border-b border-gray-100 overflow-x-auto">
              {(
                [
                  ['pending', 'Pending'],
                  ['active', 'Active'],
                  ['completed', 'Completed'],
                  ['inactive', 'Rejected / Cancelled'],
                ] as const
              ).map(([tab, label]) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setResTab(tab)}
                  className={`flex-1 min-w-[120px] py-3 text-sm font-medium whitespace-nowrap px-2 transition ${
                    resTab === tab
                      ? 'border-b-2 border-[#6B8A62] text-[#6B8A62]'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="p-4 max-h-[560px] overflow-y-auto space-y-3">
              {filteredReservations.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <FaInbox className="text-3xl mx-auto mb-2" />
                  No reservations in this tab
                </div>
              ) : (
                filteredReservations.map((res) => {
                  const pending = matchesStatusGroup(STATUS_GROUPS.pending, res.status);
                  const active = matchesStatusGroup(STATUS_GROUPS.active, res.status);
                  const statusStyles = getReservationStatusStyles(res.status);
                  return (
                    <div
                      key={res.id}
                      className={`border border-gray-100 border-l-4 ${statusStyles.border} rounded-xl p-4 hover:shadow-md transition`}
                    >
                      <div className="flex flex-wrap justify-between gap-2 mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">{res.userName}</h3>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <FaChair className="text-gray-400" /> Table {res.tableNumber || '—'}
                            <span className="text-gray-300">·</span>
                            <FaUsers className="text-gray-400" /> {res.numberOfGuests} guests
                          </p>
                        </div>
                        <span className={`inline-flex items-center justify-center text-xs font-medium px-2 py-0.5 rounded-full capitalize ${statusStyles.badge}`}>
                          {formatStatusLabel(res.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2 flex items-center gap-1.5">
                        <FaClock className="text-gray-400" />
                        {new Date(res.startDateTime).toLocaleString()} –{' '}
                        {new Date(res.endDateTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      {res.notes && (
                        <p className="text-xs bg-amber-50 text-amber-800 p-2 rounded-lg mb-3">
                          {res.notes}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {pending && (
                          <>
                            <button
                              type="button"
                              disabled={actionId === res.id}
                              onClick={() => runReservationAction(res.id, 'approve')}
                              className="px-3 py-1.5 bg-[#6B8A62] text-white text-sm rounded-lg disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              disabled={actionId === res.id}
                              onClick={() => runReservationAction(res.id, 'reject')}
                              className="px-3 py-1.5 border border-red-200 text-red-600 text-sm rounded-lg disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {active && (
                          <button
                            type="button"
                            disabled={actionId === res.id}
                            onClick={() => runReservationAction(res.id, 'complete')}
                            className="px-3 py-1.5 border border-gray-200 text-gray-700 text-sm rounded-lg disabled:opacity-50"
                          >
                            Mark complete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {section === 'staff' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FaUsers className="text-[#6B8A62]" />
                Staff team
              </h2>
              <button
                type="button"
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center gap-2 bg-[#6B8A62] text-white text-sm px-4 py-2 rounded-xl hover:bg-[#5A7352]"
              >
                <FaUserPlus />
                Invite staff
              </button>
            </div>
            {staffList.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <FaUsers className="text-3xl mx-auto mb-2" />
                No staff members yet
              </div>
            ) : (
              <ul className="space-y-2">
                {staffList.map((staff, idx) => (
                  <li
                    key={staff.email ?? staff.userName ?? idx}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6B8A62]/10 text-[#6B8A62] font-semibold flex items-center justify-center text-sm shrink-0">
                        {getInitials(staff.displayName ?? staff.userName ?? staff.email)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{staff.displayName ?? staff.userName ?? staff.email ?? '—'}</p>
                        <p className="text-xs text-gray-500">{staff.email}</p>
                        {staff.phoneNumber && (
                          <p className="text-xs text-gray-400">{staff.phoneNumber}</p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleBlockStaff(staff)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="Block staff"
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {section === 'tables' && (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FaChair className="text-[#6B8A62]" />
                Tables
              </h2>
              {tables.length === 0 ? (
                <p className="text-gray-400 text-center py-8">No tables configured</p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-3">
                  {tables.map((t) => (
                    <div key={t.tableNumber} className="p-4 border border-gray-100 rounded-xl space-y-2 hover:shadow-md transition">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-xl bg-[#6B8A62]/10 text-[#6B8A62] flex items-center justify-center text-lg shrink-0">
                            <FaChair />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">Table #{t.tableNumber}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1">
                              <FaUsers className="text-gray-400 text-xs" /> Seats {t.capacity}
                            </p>
                            <span
                              className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full mt-1 ${
                                t.isAvailable
                                  ? 'bg-emerald-100 text-emerald-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                            >
                              {t.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTableNum(t.tableNumber);
                              setEditCapacity(String(t.capacity));
                            }}
                            className="text-[#6B8A62] hover:bg-[#6B8A62]/10 p-2 rounded-lg"
                            title="Edit capacity"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteTable(t.tableNumber)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            title="Delete table"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </div>
                      {editingTableNum === t.tableNumber && (
                        <div className="flex gap-2 items-center pt-1">
                          <input
                            type="number"
                            min={1}
                            value={editCapacity}
                            onChange={e => setEditCapacity(e.target.value)}
                            placeholder="New capacity"
                            className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6B8A62]"
                          />
                          <button
                            type="button"
                            onClick={() => void handleEditTable(t.tableNumber)}
                            className="px-3 py-1.5 bg-[#6B8A62] text-white text-sm rounded-lg hover:bg-[#5A7352]"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingTableNum(null)}
                            className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <form
              onSubmit={handleAddTable}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-fit"
            >
              <h3 className="font-semibold text-gray-900 mb-4">Add table</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Table number</label>
                  <input
                    type="number"
                    min={1}
                    value={newTable.tableNumber}
                    onChange={(e) => setNewTable({ ...newTable, tableNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">Capacity</label>
                  <input
                    type="number"
                    min={1}
                    value={newTable.capacity}
                    onChange={(e) => setNewTable({ ...newTable, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62]"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 bg-[#6B8A62] text-white rounded-xl text-sm font-medium hover:bg-[#5A7352] disabled:opacity-50"
                >
                  Add table
                </button>
              </div>
            </form>
          </div>
        )}

        {section === 'menu' && (
          <div className="space-y-6">
            <form
              onSubmit={handleAddCategory}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col sm:flex-row gap-3 sm:items-end"
            >
              <div className="flex-1">
                <label className="block text-sm text-gray-600 mb-1">New category name</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g. Desserts"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62]"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6B8A62] text-white rounded-xl text-sm font-medium hover:bg-[#5A7352] disabled:opacity-50"
              >
                <FaPlus /> Add category
              </button>
            </form>

            {categories.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
                <FaClipboardList className="text-3xl mx-auto mb-2" />
                No menu categories yet
              </div>
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4 gap-2">
                    {editingCategoryId === cat.id ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={editCategoryName}
                          onChange={(e) => setEditCategoryName(e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6B8A62]"
                        />
                        <button
                          type="button"
                          onClick={() => void handleUpdateCategory(cat.id)}
                          className="px-3 py-1.5 bg-[#6B8A62] text-white text-sm rounded-lg hover:bg-[#5A7352] inline-flex items-center gap-1"
                        >
                          <FaSave /> Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCategoryId(null)}
                          className="px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                          <FaClipboardList className="text-[#6B8A62]" />
                          {cat.name}
                        </h3>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategoryId(cat.id);
                              setEditCategoryName(cat.name);
                            }}
                            className="text-[#6B8A62] hover:bg-[#6B8A62]/10 p-2 rounded-lg"
                            title="Rename category"
                          >
                            <FaEdit />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCategory(cat)}
                            className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                            title="Delete category"
                          >
                            <FaTrashAlt />
                          </button>
                        </div>
                      </>
                    )}
                  </div>

                  {(menuItemsByCategory[cat.id] ?? []).length === 0 ? (
                    <p className="text-gray-400 text-sm py-2">No items in this category</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3 mb-4">
                      {(menuItemsByCategory[cat.id] ?? []).map((item) => (
                        <div key={item.id} className="p-4 border border-gray-100 rounded-xl space-y-2 hover:shadow-md transition">
                          {editingItemId === item.id ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={editItem.name}
                                onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                                placeholder="Name"
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6B8A62]"
                              />
                              <textarea
                                value={editItem.description}
                                onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                                placeholder="Description"
                                rows={2}
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6B8A62]"
                              />
                              <input
                                type="number"
                                min={0}
                                value={editItem.price}
                                onChange={(e) => setEditItem({ ...editItem, price: e.target.value })}
                                placeholder="Price"
                                className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-[#6B8A62]"
                              />
                              {(editItem.image || item.imageUrl) && (
                                <img
                                  src={editItem.image ? URL.createObjectURL(editItem.image) : item.imageUrl!}
                                  alt={item.name}
                                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                                />
                              )}
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setEditItem({ ...editItem, image: e.target.files?.[0] ?? null })}
                                className="w-full text-xs text-gray-600 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:bg-[#6B8A62]/10 file:text-[#6B8A62] file:font-medium hover:file:bg-[#6B8A62]/20"
                              />
                              <div className="flex gap-2">
                                <button
                                  type="button"
                                  onClick={() => void handleUpdateMenuItem(item.id)}
                                  className="flex-1 px-3 py-1.5 bg-[#6B8A62] text-white text-sm rounded-lg hover:bg-[#5A7352] inline-flex items-center justify-center gap-1"
                                >
                                  <FaSave /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingItemId(null)}
                                  className="flex-1 px-3 py-1.5 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex justify-between items-start gap-2">
                              <div className="flex gap-3 flex-1">
                                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                                  {item.imageUrl ? (
                                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <FaImage className="text-gray-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{item.name}</p>
                                  {item.description && (
                                    <p className="text-sm text-gray-500">{item.description}</p>
                                  )}
                                  <p className="text-sm font-medium text-[#6B8A62] mt-1">${item.price.toFixed(2)}</p>
                                </div>
                              </div>
                              <div className="flex gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingItemId(item.id);
                                    setEditItem({
                                      name: item.name,
                                      description: item.description,
                                      price: String(item.price),
                                      image: null,
                                    });
                                  }}
                                  className="text-[#6B8A62] hover:bg-[#6B8A62]/10 p-2 rounded-lg"
                                  title="Edit item"
                                >
                                  <FaEdit />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteMenuItem(item)}
                                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg"
                                  title="Delete item"
                                >
                                  <FaTrashAlt />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <form
                    onSubmit={(e) => handleAddMenuItem(e, cat.id)}
                    className="border-t border-gray-100 pt-4 grid sm:grid-cols-5 gap-2 items-end"
                  >
                    <div className="sm:col-span-2">
                      <label className="block text-xs text-gray-500 mb-1">Item name</label>
                      <input
                        type="text"
                        value={newMenuItem[cat.id]?.name ?? ''}
                        onChange={(e) =>
                          setNewMenuItem((prev) => ({
                            ...prev,
                            [cat.id]: { ...(prev[cat.id] ?? { name: '', description: '', price: '', image: null }), name: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Description</label>
                      <input
                        type="text"
                        value={newMenuItem[cat.id]?.description ?? ''}
                        onChange={(e) =>
                          setNewMenuItem((prev) => ({
                            ...prev,
                            [cat.id]: { ...(prev[cat.id] ?? { name: '', description: '', price: '', image: null }), description: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          setNewMenuItem((prev) => ({
                            ...prev,
                            [cat.id]: {
                              ...(prev[cat.id] ?? { name: '', description: '', price: '', image: null }),
                              image: e.target.files?.[0] ?? null,
                            },
                          }))
                        }
                        className="w-full text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-2 file:rounded-lg file:border-0 file:bg-[#6B8A62]/10 file:text-[#6B8A62] file:font-medium hover:file:bg-[#6B8A62]/20"
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        value={newMenuItem[cat.id]?.price ?? ''}
                        onChange={(e) =>
                          setNewMenuItem((prev) => ({
                            ...prev,
                            [cat.id]: { ...(prev[cat.id] ?? { name: '', description: '', price: '', image: null }), price: e.target.value },
                          }))
                        }
                        placeholder="Price"
                        className="w-20 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62]"
                        required
                      />
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-3 py-2 bg-[#6B8A62] text-white rounded-xl text-sm font-medium hover:bg-[#5A7352] disabled:opacity-50 inline-flex items-center gap-1"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  </form>
                </div>
              ))
            )}
          </div>
        )}
      </DashboardShell>

      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold">Invite staff</h3>
              <button type="button" onClick={() => setShowInviteModal(false)} className="text-gray-400">
                <FaTimes />
              </button>
            </div>
            <form onSubmit={handleInvite} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="staff@restaurant.com"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#6B8A62]"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#6B8A62] text-white rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? <FaSpinner className="animate-spin" /> : <FaPaperPlane />}
                  Send invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
