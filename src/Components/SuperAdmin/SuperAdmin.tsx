import { useState, useEffect, useCallback } from 'react';
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaStore,
  FaStar,
  FaCheckCircle,
  FaTimesCircle,
  FaSpinner,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from '../../services/api/client';
import { API } from '../../constants/api';
import { deleteRestaurant } from '../../services/restaurant';
import { unwrapApiResponse } from '../../lib/api-helpers';
import type { RestaurantApiDto, CreateRestaurantApiCommand, UpdateRestaurantApiCommand } from '../../types/restaurant';
import type { ApiResponse } from '../../types/common';
import type { PaginationData } from '../../types/reservation';
import DashboardShell, { StatCard } from '../dashboard/DashboardShell';
import { ToastStack, createToast, type ToastMessage } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';

interface RestaurantForm {
  name: string;
  address: string;
  phone: string;
  openingHours: string;
  ownerEmail: string;
  isActive: boolean;
}

const emptyForm = (): RestaurantForm => ({
  name: '',
  address: '',
  phone: '',
  openingHours: '9:00 AM - 10:00 PM',
  ownerEmail: '',
  isActive: true,
});

export default function SuperAdmin() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantApiDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | null>(null);
  const [selected, setSelected] = useState<RestaurantApiDto | null>(null);
  const [form, setForm] = useState<RestaurantForm>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const pushToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToasts((prev) => [...prev, createToast(text, type)]);
  };

  const dismissToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const fetchRestaurants = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiGet<ApiResponse<PaginationData<RestaurantApiDto>>>(
        `${API.restaurant.list}?PageIndex=0&PageSize=100`
      );
      const page = unwrapApiResponse(response);
      setRestaurants(page.data ?? []);
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to load restaurants', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchRestaurants();
  }, [fetchRestaurants]);

  const filtered = restaurants.filter((r) =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeCount = restaurants.filter((r) => r.isActive).length;
  const avgRating =
    restaurants.length > 0
      ? restaurants.reduce((s, r) => s + (r.averageRating ?? 0), 0) / restaurants.length
      : 0;

  const openAdd = () => {
    setForm(emptyForm());
    setSelected(null);
    setModal('add');
  };

  const openEdit = (r: RestaurantApiDto) => {
    setSelected(r);
    setForm({
      name: r.name,
      address: '',
      phone: '',
      openingHours: '9:00 AM - 10:00 PM',
      ownerEmail: '',
      isActive: r.isActive,
    });
    setModal('edit');
  };

  const openDelete = (r: RestaurantApiDto) => {
    setSelected(r);
    setModal('delete');
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.phone || !form.ownerEmail) {
      pushToast('Please fill all required fields', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const body: CreateRestaurantApiCommand = {
        ownerEmail: form.ownerEmail,
        name: form.name,
        address: form.address,
        phone: form.phone,
        isActive: form.isActive,
        openingHours: form.openingHours || '9:00 AM - 10:00 PM',
      };
      const response = await apiPost<ApiResponse<RestaurantApiDto>>(API.restaurant.create, body);
      unwrapApiResponse(response);
      pushToast('Restaurant created successfully');
      setModal(null);
      await fetchRestaurants();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to create restaurant', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    try {
      const body: UpdateRestaurantApiCommand = {
        restaurantId: selected.id,
        address: form.address,
        phone: form.phone,
        isActive: form.isActive,
        openingHours: form.openingHours,
      };
      const response = await apiPatch<ApiResponse<RestaurantApiDto>>(API.restaurant.update, body);
      unwrapApiResponse(response);
      pushToast('Restaurant updated');
      setModal(null);
      await fetchRestaurants();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to update restaurant', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selected) return;
    setSubmitting(true);
    try {
      await deleteRestaurant(selected.id);
      pushToast('Restaurant deleted');
      setModal(null);
      setSelected(null);
      await fetchRestaurants();
    } catch (err) {
      pushToast(err instanceof Error ? err.message : 'Failed to delete restaurant', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate(APP_ROUTES.login);
  };

  return (
    <>
      <DashboardShell
        badge="Super Admin"
        title="Restaurant management"
        subtitle="Create and manage restaurants across the platform"
        userName={user?.displayName}
        onLogout={handleLogout}
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#6B8A62] hover:bg-[#5A7352] text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition"
          >
            <FaPlus />
            Add restaurant
          </button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total restaurants" value={restaurants.length} icon={<FaStore />} accent="emerald" />
          <StatCard label="Active" value={activeCount} icon={<FaCheckCircle />} accent="blue" />
          <StatCard
            label="Inactive"
            value={restaurants.length - activeCount}
            icon={<FaTimesCircle />}
            accent="rose"
          />
          <StatCard label="Avg rating" value={avgRating.toFixed(1)} icon={<FaStar />} accent="amber" />
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-4">
          <div className="relative max-w-md">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62]"
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <FaSpinner className="animate-spin text-3xl text-[#6B8A62]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Rating</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-14 text-center text-gray-500">
                        No restaurants found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/50 transition">
                        <td className="px-6 py-4 text-sm text-gray-500">#{r.id}</td>
                        <td className="px-6 py-4 font-medium text-gray-900">{r.name}</td>
                        <td className="px-6 py-4 text-sm">
                          {(r.averageRating ?? 0).toFixed(1)}{' '}
                          <span className="text-amber-400">★</span>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${
                              r.isActive
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {r.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => openEdit(r)}
                              className="p-2 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDelete(r)}
                              className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition"
                              title="Delete"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </DashboardShell>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {modal === 'delete' ? (
              <>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">Delete restaurant</h2>
                </div>
                <div className="p-6">
                  <p className="text-gray-600">
                    Delete <strong>{selected?.name}</strong>? This cannot be undone.
                  </p>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <FaSpinner className="animate-spin" />}
                    Delete
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={modal === 'add' ? handleAdd : handleEdit}>
                <div className="p-6 border-b border-gray-100">
                  <h2 className="text-xl font-bold text-gray-900">
                    {modal === 'add' ? 'Add restaurant' : `Edit ${selected?.name}`}
                  </h2>
                </div>
                <div className="p-6 space-y-4">
                  {modal === 'add' && (
                    <>
                      <Field label="Restaurant name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
                      <Field
                        label="Owner email *"
                        type="email"
                        value={form.ownerEmail}
                        onChange={(v) => setForm({ ...form, ownerEmail: v })}
                      />
                    </>
                  )}
                  {modal === 'edit' && (
                    <p className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
                      Restaurant name cannot be changed via API. Update contact details and status below.
                    </p>
                  )}
                  <Field label="Address *" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
                  <Field label="Phone *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
                  <Field
                    label="Opening hours"
                    value={form.openingHours}
                    onChange={(v) => setForm({ ...form, openingHours: v })}
                    placeholder="9:00 AM - 10:00 PM"
                  />
                  <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="rounded border-gray-300 text-[#6B8A62] focus:ring-[#6B8A62]"
                    />
                    Restaurant is active
                  </label>
                </div>
                <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setModal(null)}
                    className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 rounded-xl bg-[#6B8A62] text-white hover:bg-[#5A7352] disabled:opacity-50 flex items-center gap-2"
                  >
                    {submitting && <FaSpinner className="animate-spin" />}
                    {modal === 'add' ? 'Create' : 'Save'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={label.includes('*')}
        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62]"
      />
    </div>
  );
}
