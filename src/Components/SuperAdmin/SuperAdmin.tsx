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
  FaDownload,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaBuilding,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaUtensils,
  FaBoxes,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { apiGet, apiPatch, apiPost } from '../../services/api/client';
import { API } from '../../constants/api';
import { deleteRestaurant } from '../../services/restaurant';
import { unwrapApiResponse } from '../../lib/api-helpers';
import type { RestaurantApiDto, CreateRestaurantApiCommand, UpdateRestaurantApiCommand } from '../../types/restaurant';
import type { ApiResponse } from '../../types/common';
import type { PaginationData } from '../../types/reservation';
import DashboardShell from '../dashboard/DashboardShell';
import { ToastStack, createToast, type ToastMessage } from '../common/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';

// Modern Card Component
function StatCardEnhanced({ 
  icon: Icon, 
  label, 
  value, 
  trend, 
  color 
}: { 
  icon: any; 
  label: string; 
  value: number | string; 
  trend?: { value: number; isPositive: boolean }; 
  color: string;
}) {
  return (
    <div className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100">
      <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${color} text-white shadow-lg`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <span className={`text-xs font-medium px-2 py-1 rounded-full ${
              trend.isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// Restaurant Card Component (Grid View)
function RestaurantCard({ 
  restaurant, 
  onEdit, 
  onDelete,
  onView,
}: { 
  restaurant: RestaurantApiDto; 
  onEdit: (r: RestaurantApiDto) => void; 
  onDelete: (r: RestaurantApiDto) => void;
  onView: (r: RestaurantApiDto) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header with gradient */}
      <div className={`h-2 bg-gradient-to-r ${restaurant.isActive ? 'from-emerald-500 to-teal-500' : 'from-gray-400 to-gray-500'}`} />
      
      <div className="p-6">
        {/* Title & Status */}
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-1">{restaurant.name}</h3>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <FaStar className="text-amber-400 w-3.5 h-3.5" />
                <span className="text-sm font-medium text-gray-700">
                  {(restaurant.averageRating ?? 0).toFixed(1)}
                </span>
              </div>
              <span className="text-xs text-gray-400">•</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                restaurant.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {restaurant.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onView(restaurant)}
              className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition"
              title="View Details"
            >
              <FaEye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(restaurant)}
              className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 transition"
              title="Edit"
            >
              <FaEdit className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(restaurant)}
              className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition"
              title="Delete"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4">
          {restaurant.address && (
            <div className="flex items-start gap-2 text-sm text-gray-600">
              <FaMapMarkerAlt className="w-3.5 h-3.5 mt-0.5 text-gray-400 flex-shrink-0" />
              <span className="line-clamp-1">{restaurant.address}</span>
            </div>
          )}
          {restaurant.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <FaPhone className="w-3.5 h-3.5 text-gray-400" />
              <span>{restaurant.phone}</span>
            </div>
          )}
        </div>

        {/* Footer with animation on hover */}
        <div className={`pt-3 border-t border-gray-100 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={() => onView(restaurant)}
            className="w-full text-center text-sm font-medium text-[#6B8A62] hover:text-[#5A7352] transition"
          >
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
}

// Detailed Modal Component
function RestaurantDetailModal({ 
  restaurant, 
  onClose 
}: { 
  restaurant: RestaurantApiDto; 
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slideUp">
        <div className={`h-2 bg-gradient-to-r ${restaurant.isActive ? 'from-emerald-500 to-teal-500' : 'from-gray-400 to-gray-500'}`} />
        
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{restaurant.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex items-center gap-1">
                  <FaStar className="text-amber-400" />
                  <span className="font-medium">{(restaurant.averageRating ?? 0).toFixed(1)}</span>
                </div>
                <span className="text-gray-300">|</span>
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                  restaurant.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {restaurant.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <FaTimesCircle className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <InfoItem icon={FaBuilding} label="Restaurant ID" value={`#${restaurant.id}`} />
            <InfoItem icon={FaMapMarkerAlt} label="Address" value={restaurant.address || 'Not specified'} />
            <InfoItem icon={FaPhone} label="Phone" value={restaurant.phone || 'Not specified'} />
            <InfoItem icon={FaClock} label="Opening Hours" value={restaurant.openingHours || 'Not specified'} />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
            <StatBadge icon={FaUtensils} label="Total Tables" value="24" />
            <StatBadge icon={FaUsers} label="Staff Members" value="12" />
            <StatBadge icon={FaBoxes} label="Active Orders" value="8" />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
      <Icon className="w-4 h-4 text-gray-400 mt-0.5" />
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-medium text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function StatBadge({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="text-center p-3 bg-gradient-to-br from-gray-50 to-white rounded-xl">
      <Icon className="w-4 h-4 text-[#6B8A62] mx-auto mb-1" />
      <p className="text-lg font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}

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
  const { user } = useAuth();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState<RestaurantApiDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [modal, setModal] = useState<'add' | 'edit' | 'delete' | 'view' | null>(null);
  const [selected, setSelected] = useState<RestaurantApiDto | null>(null);
  const [form, setForm] = useState<RestaurantForm>(emptyForm());
  const [submitting, setSubmitting] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

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

  const paginatedRestaurants = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

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
      address: r.address || '',
      phone: r.phone || '',
      openingHours: r.openingHours || '9:00 AM - 10:00 PM',
      ownerEmail: '',
      isActive: r.isActive,
    });
    setModal('edit');
  };

  const openView = (r: RestaurantApiDto) => {
    setSelected(r);
    setModal('view');
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
      pushToast('Restaurant updated successfully');
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
      pushToast('Restaurant deleted successfully');
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
    // Route through the centralized logout screen so history/back cannot restore the session.
    navigate(APP_ROUTES.logout);
  };


  return (
    <>
      <DashboardShell
        badge="Super Admin"
        title="System Administrator"
        subtitle="Full platform control and restaurant oversight"
        userName={user?.displayName}
        onLogout={handleLogout}
        actions={
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#6B8A62] to-[#5A7352] hover:from-[#5A7352] hover:to-[#4A6242] text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <FaPlus className="w-4 h-4" />
            Add Restaurant
          </button>
        }
      >
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCardEnhanced
            icon={FaStore}
            label="Total Restaurants"
            value={restaurants.length}
            trend={{ value: 12, isPositive: true }}
            color="from-emerald-500 to-teal-500"
          />
          <StatCardEnhanced
            icon={FaCheckCircle}
            label="Active Restaurants"
            value={activeCount}
            color="from-blue-500 to-cyan-500"
          />
          <StatCardEnhanced
            icon={FaTimesCircle}
            label="Inactive Restaurants"
            value={restaurants.length - activeCount}
            color="from-rose-500 to-pink-500"
          />
          <StatCardEnhanced
            icon={FaStar}
            label="Average Rating"
            value={avgRating.toFixed(1)}
            color="from-amber-500 to-orange-500"
          />
        </div>

        {/* Search and View Controls */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm mb-6 p-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="search"
                placeholder="Search restaurants by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] transition"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-[#6B8A62] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-2 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-[#6B8A62] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </button>
              <button className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
                <FaDownload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-4xl text-[#6B8A62] mb-4" />
            <p className="text-gray-500">Loading restaurants...</p>
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedRestaurants.map((restaurant) => (
                  <RestaurantCard
                    key={restaurant.id}
                    restaurant={restaurant}
                    onEdit={openEdit}
                    onDelete={openDelete}
                    onView={openView}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Address</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginatedRestaurants.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-6 py-14 text-center text-gray-500">
                            <FaStore className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            No restaurants found
                          </td>
                        </tr>
                      ) : (
                        paginatedRestaurants.map((r) => (
                          <tr key={r.id} className="hover:bg-gray-50/50 transition group">
                            <td className="px-6 py-4 text-sm text-gray-500 font-mono">#{r.id}</td>
                            <td className="px-6 py-4 font-semibold text-gray-900">{r.name}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{r.address || '—'}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1">
                                <FaStar className="text-amber-400 w-4 h-4" />
                                <span className="text-sm font-medium">{(r.averageRating ?? 0).toFixed(1)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${
                                r.isActive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                {r.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openView(r)}
                                  className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition"
                                  title="View"
                                >
                                  <FaEye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openEdit(r)}
                                  className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition"
                                  title="Edit"
                                >
                                  <FaEdit className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => openDelete(r)}
                                  className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition"
                                  title="Delete"
                                >
                                  <FaTrash className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-medium transition ${
                          currentPage === pageNum
                            ? 'bg-[#6B8A62] text-white shadow-md'
                            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </DashboardShell>

      {/* Modals */}
      {modal === 'view' && selected && (
        <RestaurantDetailModal restaurant={selected} onClose={() => setModal(null)} />
      )}

      {modal === 'delete' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slideUp">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 rounded-full bg-rose-100">
                <FaTrash className="w-6 h-6 text-rose-600" />
              </div>
              <h2 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Restaurant</h2>
              <p className="text-center text-gray-600 mb-6">
                Are you sure you want to delete <strong className="text-gray-900">{selected?.name}</strong>?<br />
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setModal(null)}
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 flex items-center justify-center gap-2 transition"
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {(modal === 'add' || modal === 'edit') && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
            <form onSubmit={modal === 'add' ? handleAdd : handleEdit}>
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">
                  {modal === 'add' ? 'Add New Restaurant' : `Edit ${selected?.name}`}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {modal === 'add' ? 'Fill in the details to create a new restaurant' : 'Update restaurant information'}
                </p>
              </div>
              <div className="p-6 space-y-4">
                {modal === 'add' && (
                  <>
                    <ModernField
                      label="Restaurant Name"
                      value={form.name}
                      onChange={(v) => setForm({ ...form, name: v })}
                      placeholder="Enter restaurant name"
                      required
                      icon={FaBuilding}
                    />
                    <ModernField
                      label="Owner Email"
                      type="email"
                      value={form.ownerEmail}
                      onChange={(v) => setForm({ ...form, ownerEmail: v })}
                      placeholder="owner@example.com"
                      required
                      icon={FaEnvelope}
                    />
                  </>
                )}
                {modal === 'edit' && (
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4">
                    <p className="text-sm text-blue-700">Restaurant name cannot be changed. Update other details below.</p>
                  </div>
                )}
                <ModernField
                  label="Address"
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  placeholder="Full address"
                  required
                  icon={FaMapMarkerAlt}
                />
                <ModernField
                  label="Phone"
                  value={form.phone}
                  onChange={(v) => setForm({ ...form, phone: v })}
                  placeholder="+1 234 567 8900"
                  required
                  icon={FaPhone}
                />
                <ModernField
                  label="Opening Hours"
                  value={form.openingHours}
                  onChange={(v) => setForm({ ...form, openingHours: v })}
                  placeholder="9:00 AM - 10:00 PM"
                  icon={FaClock}
                />
                <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Restaurant Active</span>
                    <p className="text-xs text-gray-500">Inactive restaurants won't appear to customers</p>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                      className="sr-only peer"
                      id="isActive"
                    />
                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#6B8A62] peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </div>
                </label>
              </div>
              <div className="p-6 border-t border-gray-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModal(null)}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white hover:shadow-lg disabled:opacity-50 flex items-center gap-2 transition"
                >
                  {submitting && <FaSpinner className="animate-spin" />}
                  {modal === 'add' ? 'Create Restaurant' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastStack toasts={toasts} onDismiss={dismissToast} />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </>
  );
}

function ModernField({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required,
  icon: Icon,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  icon?: any;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon className="w-4 h-4 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] transition`}
        />
      </div>
    </div>
  );
}
