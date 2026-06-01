import { useAuth } from '../../contexts/AuthContext';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  ChevronRightIcon,
  XMarkIcon,
  CheckCircleIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaCalendarAlt } from 'react-icons/fa';
import { APP_ROUTES } from '../../constants/routes';
import { cancelReservation, getAllUserReservations } from '../../services/reservation';
import { addReview } from '../../services/restaurant';
import type { ReservationUserItem } from '../../types/reservation';
import type { AddReviewCommand } from '../../types/restaurant';
import {
  STATUS_GROUPS,
  matchesStatusGroup,
  formatStatusLabel,
} from '../../lib/reservation-status';
import { getStatusHelperText, isPendingApproval } from '../../lib/reservation-workflow';

const POLL_INTERVAL_MS = 25_000;

const getStatusStyles = (status: string | number) => {
  if (matchesStatusGroup(STATUS_GROUPS.active, status)) {
    return {
      bg: 'bg-green-100',
      text: 'text-green-800',
      border: 'border-l-green-500',
      icon: <CheckCircleIcon className="w-4 h-4 mr-1" />,
    };
  }
  if (matchesStatusGroup(STATUS_GROUPS.pending, status)) {
    return {
      bg: 'bg-amber-100',
      text: 'text-amber-800',
      border: 'border-l-amber-500',
      icon: <QuestionMarkCircleIcon className="w-4 h-4 mr-1" />,
    };
  }
  if (matchesStatusGroup(STATUS_GROUPS.inactive, status)) {
    return {
      bg: 'bg-gray-100',
      text: 'text-gray-600',
      border: 'border-l-gray-400',
      icon: <XMarkIcon className="w-4 h-4 mr-1" />,
    };
  }
  return {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-l-gray-300',
    icon: null,
  };
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const canBeCancelled = (status: string | number) =>
  matchesStatusGroup(STATUS_GROUPS.pending, status) ||
  matchesStatusGroup(STATUS_GROUPS.active, status);

// Component
const MyReservations = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [showPast, setShowPast] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<number | null>(null);
  const [reservations, setReservations] = useState<ReservationUserItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Review modal state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedForReview, setSelectedForReview] = useState<ReservationUserItem | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Computed values
  const pendingReservations = useMemo(
    () => reservations.filter((r) => isPendingApproval(r.status)),
    [reservations]
  );

  const confirmedUpcoming = useMemo(
    () =>
      reservations.filter(
        (r) =>
          !matchesStatusGroup(STATUS_GROUPS.inactive, r.status) &&
          !isPendingApproval(r.status)
      ),
    [reservations]
  );

  const activeReservations = useMemo(
    () => [...pendingReservations, ...confirmedUpcoming],
    [pendingReservations, confirmedUpcoming]
  );

  const pastReservations = useMemo(
    () => reservations.filter((r) => matchesStatusGroup(STATUS_GROUPS.inactive, r.status)),
    [reservations]
  );

  const fetchReservations = useCallback(async () => {
    if (!user?.token) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await getAllUserReservations({ pageIndex: 0, pageSize: 50 });
      if (!response.succeeded) throw new Error(response.message || 'Failed to fetch reservations');
      setReservations(response.data?.data ?? []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch reservations';
      setError(
        message.includes('500') ? 'Server error. Please try again later.' : message
      );
    } finally {
      setIsLoading(false);
    }
  }, [user?.token]);

  // Cancel reservation
  const handleCancel = async () => {
    if (!reservationToCancel) return;
    
    setIsCancelling(true);
    try {
      const response = await cancelReservation(reservationToCancel);
      if (!response.succeeded) throw new Error(response.message || 'Cancel failed');
      
      setShowCancelModal(false);
      setReservationToCancel(null);
      await fetchReservations();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to cancel reservation');
    } finally {
      setIsCancelling(false);
    }
  };

  // Submit review
  const handleSubmitReview = async () => {
    if (!selectedForReview) return;
    if (!reviewComment.trim()) {
      alert('Please add a comment');
      return;
    }
    
    setIsSubmittingReview(true);
    try {
      const reviewData: AddReviewCommand = {
        restaurantId: selectedForReview.restaurantId,
        rating: reviewRating,
        comment: reviewComment.trim()
      };
      
      await addReview(reviewData);
      alert('Thank you for your review!');
      
      setShowReviewModal(false);
      setSelectedForReview(null);
      setReviewComment('');
      setReviewRating(5);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // Effects
  useEffect(() => {
    if (!authLoading && isAuthenticated && user?.token) {
      fetchReservations();
    }
  }, [authLoading, isAuthenticated, user?.token, fetchReservations]);

  useEffect(() => {
    if (!isAuthenticated || pendingReservations.length === 0) return;
    const interval = setInterval(() => {
      void fetchReservations();
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [isAuthenticated, pendingReservations.length, fetchReservations]);

  // Loading state
  if (authLoading || (isLoading && !reservations.length)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6B8A62] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Loading your reservations...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#6B8A62]/10 pt-20 flex items-center justify-center p-6">
        <div className="text-center max-w-md bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="bg-[#6B8A62]/10 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
            <CalendarIcon className="w-10 h-10 text-[#6B8A62]" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in required</h2>
          <p className="text-gray-600 mb-6">Log in to view and manage your table reservations.</p>
          <Link
            to={APP_ROUTES.login}
            className="inline-flex items-center px-6 py-3 bg-[#6B8A62] text-white rounded-xl hover:bg-[#5A7352] transition-all font-medium"
          >
            Sign In
            <ChevronRightIcon className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          type="button"
          onClick={() => navigate(APP_ROUTES.home)}
          className="inline-flex items-center gap-2 text-[#6B8A62] hover:text-[#5A7352] font-medium transition-colors mb-6"
        >
          <FaChevronLeft className="text-sm" />
          Back to Home
        </button>

        <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8 bg-gradient-to-r from-[#6B8A62] to-[#5A7352]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute right-0 top-0 w-48 h-48 bg-white rounded-full -mr-16 -mt-16" />
          </div>
          <div className="relative px-6 py-8 sm:px-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-medium mb-3">
                <FaCalendarAlt />
                Your bookings
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Reservations</h1>
              <p className="text-white/80 text-sm sm:text-base">
                Track upcoming tables and revisit past dining experiences.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Pending approval"
            value={pendingReservations.length}
            icon={<QuestionMarkCircleIcon className="w-6 h-6 text-amber-600" />}
            accent="from-amber-50 to-white"
          />
          <StatCard
            title="Confirmed upcoming"
            value={confirmedUpcoming.length}
            icon={<CheckCircleIcon className="w-6 h-6 text-green-600" />}
            accent="from-green-50 to-white"
          />
          <StatCard
            title="Total"
            value={reservations.length}
            icon={<CalendarIcon className="w-6 h-6 text-[#6B8A62]" />}
            accent="from-[#6B8A62]/5 to-white"
          />
          <StatCard
            title="Past"
            value={pastReservations.length}
            icon={<ClockIcon className="w-6 h-6 text-blue-600" />}
            accent="from-blue-50 to-white"
          />
        </div>

        {pendingReservations.length > 0 && !showPast && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-sm text-amber-900">
            <strong>{pendingReservations.length}</strong> request
            {pendingReservations.length === 1 ? '' : 's'} waiting for staff approval. This page
            refreshes automatically until your status changes.
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 mb-6 inline-flex gap-1">
          <TabButton active={!showPast} onClick={() => setShowPast(false)}>
            Upcoming
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${!showPast ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
              {activeReservations.length}
            </span>
          </TabButton>
          <TabButton active={showPast} onClick={() => setShowPast(true)}>
            Past
            <span className={`ml-1.5 px-2 py-0.5 rounded-full text-xs ${showPast ? 'bg-white/20' : 'bg-gray-100 text-gray-500'}`}>
              {pastReservations.length}
            </span>
          </TabButton>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <XMarkIcon className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button
              type="button"
              onClick={fetchReservations}
              className="px-6 py-2.5 bg-[#6B8A62] text-white rounded-xl hover:bg-[#5A7352] font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Upcoming Reservations */}
        {!showPast && !error && (
          activeReservations.length === 0 ? (
            <EmptyState
              title="No Upcoming Reservations"
              message="Ready for a dining experience? Book a table at your favorite restaurant."
              buttonText="Browse Restaurants"
              buttonLink={APP_ROUTES.spots}
            />
          ) : (
            <div className="space-y-8">
              {pendingReservations.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <QuestionMarkCircleIcon className="w-5 h-5 text-amber-600" />
                    Awaiting staff approval
                  </h2>
                  <div className="grid gap-4">
                    {pendingReservations.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        isExpanded={selectedReservation === reservation.id}
                        onToggleExpand={() =>
                          setSelectedReservation(
                            selectedReservation === reservation.id ? null : reservation.id
                          )
                        }
                        onCancel={() => {
                          setReservationToCancel(reservation.id);
                          setShowCancelModal(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}
              {confirmedUpcoming.length > 0 && (
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    Confirmed upcoming
                  </h2>
                  <div className="grid gap-4">
                    {confirmedUpcoming.map((reservation) => (
                      <ReservationCard
                        key={reservation.id}
                        reservation={reservation}
                        isExpanded={selectedReservation === reservation.id}
                        onToggleExpand={() =>
                          setSelectedReservation(
                            selectedReservation === reservation.id ? null : reservation.id
                          )
                        }
                        onCancel={() => {
                          setReservationToCancel(reservation.id);
                          setShowCancelModal(true);
                        }}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )
        )}

        {/* Past Reservations */}
        {showPast && !error && (
          pastReservations.length === 0 ? (
            <EmptyState title="No Past Reservations" message="Your past reservations will appear here." />
          ) : (
            <div className="grid gap-4">
              {pastReservations.map(reservation => (
                <PastReservationCard
                  key={reservation.id}
                  reservation={reservation}
                  onReview={() => {
                    setSelectedForReview(reservation);
                    setShowReviewModal(true);
                  }}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <ConfirmModal
          title="Cancel Reservation?"
          message="Are you sure you want to cancel this reservation? This action cannot be undone."
          confirmText="Yes, Cancel"
          isProcessing={isCancelling}
          onConfirm={handleCancel}
          onClose={() => setShowCancelModal(false)}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedForReview && (
        <ReviewModal
          restaurantName={selectedForReview.restaurantName}
          rating={reviewRating}
          comment={reviewComment}
          isSubmitting={isSubmittingReview}
          onRatingChange={setReviewRating}
          onCommentChange={setReviewComment}
          onSubmit={handleSubmitReview}
          onClose={() => setShowReviewModal(false)}
        />
      )}
    </div>
  );
};

const StatCard = ({
  title,
  value,
  icon,
  accent,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) => (
  <div className={`bg-gradient-to-br ${accent} rounded-2xl shadow-sm p-5 border border-gray-100`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
      <div className="bg-white rounded-xl p-3 shadow-sm">{icon}</div>
    </div>
  </div>
);

const TabButton = ({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
      active ? 'bg-[#6B8A62] text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'
    }`}
  >
    {children}
  </button>
);

const EmptyState = ({
  title,
  message,
  buttonText,
  buttonLink,
}: {
  title: string;
  message: string;
  buttonText?: string;
  buttonLink?: string;
}) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#6B8A62]/10 rounded-2xl mb-4">
      <CalendarIcon className="w-10 h-10 text-[#6B8A62]" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6 max-w-md mx-auto">{message}</p>
    {buttonText && buttonLink && (
      <Link
        to={buttonLink}
        className="inline-flex items-center px-6 py-3 bg-[#6B8A62] text-white rounded-xl hover:bg-[#5A7352] font-medium transition-colors"
      >
        {buttonText}
        <ChevronRightIcon className="w-5 h-5 ml-2" />
      </Link>
    )}
  </div>
);

const ReservationCard = ({ 
  reservation, 
  isExpanded, 
  onToggleExpand, 
  onCancel 
}: { 
  reservation: ReservationUserItem; 
  isExpanded: boolean; 
  onToggleExpand: () => void; 
  onCancel: () => void;
}) => {
  const statusStyle = getStatusStyles(reservation.status);
  const pending = isPendingApproval(reservation.status);
  const helperText = getStatusHelperText(reservation.status);

  return (
    <div
      className={`bg-white rounded-2xl shadow-sm border border-gray-100 border-l-4 ${statusStyle.border} overflow-hidden hover:shadow-md transition-shadow`}
    >
      <div className="p-5 sm:p-6">
        {pending && (
          <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-900">
            {helperText}
          </div>
        )}
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900 truncate">{reservation.restaurantName}</h3>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}
              >
                {statusStyle.icon}
                {formatStatusLabel(reservation.status)}
              </span>
            </div>
            <p className="text-sm text-gray-500">Confirmation #{reservation.bookNumber}</p>
          </div>
          <button
            type="button"
            onClick={onToggleExpand}
            className="p-2 rounded-lg text-[#6B8A62] hover:bg-[#6B8A62]/10 transition-colors shrink-0"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            <ChevronRightIcon className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center shrink-0">
              <CalendarIcon className="w-5 h-5 text-[#6B8A62]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Date</p>
              <p className="text-sm font-medium text-gray-800 truncate">{formatDate(reservation.startDateTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center shrink-0">
              <ClockIcon className="w-5 h-5 text-[#6B8A62]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Time</p>
              <p className="text-sm font-medium text-gray-800">{formatTime(reservation.startDateTime)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
            <div className="w-9 h-9 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center shrink-0">
              <UsersIcon className="w-5 h-5 text-[#6B8A62]" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Party</p>
              <p className="text-sm font-medium text-gray-800">
                {reservation.numberOfGuests} {reservation.numberOfGuests === 1 ? 'guest' : 'guests'}
              </p>
            </div>
          </div>
        </div>

        {reservation.tableNumber > 0 && (
          <p className="mt-3 text-sm text-gray-500 flex items-center gap-1.5">
            <MapPinIcon className="w-4 h-4 text-[#6B8A62]" />
            Table {reservation.tableNumber}
          </p>
        )}

        <div className="flex flex-wrap gap-3 mt-5">
          {canBeCancelled(reservation.status) && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 text-sm font-medium transition-colors"
            >
              Cancel reservation
            </button>
          )}
        </div>

        {isExpanded && (
          <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-800">Notes: </span>
              {reservation.notes || 'None'}
            </p>
            <p className="text-xs text-gray-400">
              Booked on{' '}
              {new Date(reservation.createdAt).toLocaleDateString(undefined, {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const PastReservationCard = ({
  reservation,
  onReview,
}: {
  reservation: ReservationUserItem;
  onReview: () => void;
}) => {
  const statusStyle = getStatusStyles(reservation.status);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h3 className="text-lg font-semibold text-gray-900">{reservation.restaurantName}</h3>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusStyle.bg} ${statusStyle.text}`}
            >
              {formatStatusLabel(reservation.status)}
            </span>
          </div>
          <p className="text-gray-500 text-sm">
            {formatDate(reservation.startDateTime)} · {formatTime(reservation.startDateTime)}
          </p>
          <p className="text-gray-400 text-sm mt-0.5">
            {reservation.numberOfGuests} guests · #{reservation.bookNumber}
          </p>
        </div>
        <button
          type="button"
          onClick={onReview}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#6B8A62]/10 text-[#6B8A62] rounded-xl hover:bg-[#6B8A62]/20 text-sm font-semibold transition-colors shrink-0"
        >
          <StarIcon className="w-4 h-4" />
          Leave a review
        </button>
      </div>
    </div>
  );
};

const ConfirmModal = ({
  title,
  message,
  confirmText,
  isProcessing,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmText: string;
  confirmColor?: string;
  isProcessing: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
      <div className="text-center">
        <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <XMarkIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6 text-sm">{message}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium"
          >
            {isProcessing ? 'Processing...' : confirmText}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
          >
            Keep booking
          </button>
        </div>
      </div>
    </div>
  </div>
);

const ReviewModal = ({ 
  restaurantName, 
  rating, 
  comment, 
  isSubmitting, 
  onRatingChange, 
  onCommentChange, 
  onSubmit, 
  onClose 
}: { 
  restaurantName: string; 
  rating: number; 
  comment: string; 
  isSubmitting: boolean; 
  onRatingChange: (r: number) => void; 
  onCommentChange: (c: string) => void; 
  onSubmit: () => void; 
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
    <div className="relative bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
      <div className="text-center mb-6">
        <div className="bg-amber-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <StarIcon className="w-8 h-8 text-amber-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Rate your experience</h3>
        <p className="text-gray-600 text-sm">How was dining at {restaurantName}?</p>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="flex justify-center gap-1 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => onRatingChange(star)}
                className="p-1 transition-transform hover:scale-110"
              >
                <StarIcon
                  className={`w-9 h-9 ${star <= rating ? 'text-amber-400' : 'text-gray-200'}`}
                />
              </button>
            ))}
          </div>
          <p className="text-sm font-medium text-[#6B8A62]">
            {rating === 5
              ? 'Excellent!'
              : rating === 4
                ? 'Very good'
                : rating === 3
                  ? 'Good'
                  : rating === 2
                    ? 'Fair'
                    : 'Poor'}
          </p>
        </div>

        <textarea
          rows={4}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Share your experience at this restaurant..."
          className="w-full p-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62]"
        />
      </div>

      <div className="flex gap-3 mt-6">
        <button
          type="button"
          onClick={onSubmit}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2.5 bg-[#6B8A62] text-white rounded-xl hover:bg-[#5A7352] disabled:opacity-50 flex items-center justify-center gap-2 font-medium"
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <StarIcon className="w-4 h-4" />
          )}
          {isSubmitting ? 'Submitting...' : 'Submit review'}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
);

export default MyReservations;

