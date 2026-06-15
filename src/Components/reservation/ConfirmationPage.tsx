import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { ConfirmationOrderedFoodItem, ConfirmationState } from './ConfirmationWrapper';
import { APP_ROUTES } from '../../constants/routes';
import {
  formatStatusLabel,
  matchesStatusGroup,
  STATUS_GROUPS,
} from '../../lib/reservation-status';
import { getStatusHelperText } from '../../lib/reservation-workflow';
import {
  FiCalendar,
  FiClock,
  FiUsers,
  FiCoffee,
  FiMail,
  FiPhone,
  FiMapPin,
  FiStar,
  FiCreditCard,
  FiPrinter,
  FiShare2,
  FiArrowLeft,
  FiGift
} from 'react-icons/fi';
import { BsQrCode } from 'react-icons/bs';

interface ConfirmationPageProps {
  reservationData: ConfirmationState;
}

export default function ConfirmationPage({ reservationData }: ConfirmationPageProps) {
  const navigate = useNavigate();
  const ticketRef = useRef<HTMLDivElement>(null);
  const {
    formData,
    restaurantData,
    orderedFood,
    paymentCompleted,
    createdReservation,
    apiMessage,
  } = reservationData;

  const bookingId =
    createdReservation?.bookNumber != null
      ? `#${createdReservation.bookNumber}`
      : createdReservation?.id != null
        ? `RES-${createdReservation.id}`
        : `REQ-${Date.now().toString().slice(-6)}`;

  const status = createdReservation?.status ?? 0;
  const isPending = matchesStatusGroup(STATUS_GROUPS.pending, status);
  const statusLabel = formatStatusLabel(status);
  const bookingDate = createdReservation?.createdAt
    ? new Date(createdReservation.createdAt)
    : new Date();

  const calculateFoodTotal = () => {
    return orderedFood.reduce(
      (total: number, item: ConfirmationOrderedFoodItem) =>
        total + item.price * (item.quantity ?? 1),
      0
    );
  };

  const foodTotal = calculateFoodTotal();
  const depositPaid = paymentCompleted && foodTotal > 0;
  const depositAmount = foodTotal * 0.5;

  const handlePrint = () => {
    const printContent = ticketRef.current;
    if (printContent) {
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContent.innerHTML;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-[#6B8A62]/10">
      {/* Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#6B8A62]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#6B8A62]/20 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Success Header with Emerald Accent */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-[#6B8A62] mb-3">
            {isPending ? 'Request submitted' : 'Reservation updated'}
          </h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            {isPending ? (
              <>
                Your booking request was sent to staff at{' '}
                <span className="font-semibold text-[#6B8A62]">{restaurantData.name}</span>. It
                will appear in My Reservations as{' '}
                <span className="font-semibold text-amber-700">pending</span> until approved.
              </>
            ) : (
              <>
                Your reservation at{' '}
                <span className="font-semibold text-[#6B8A62]">{restaurantData.name}</span> is{' '}
                <span className="font-semibold">{statusLabel}</span>.
              </>
            )}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span
              className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold ${
                isPending
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {statusLabel}
            </span>
          </div>
          {apiMessage && (
            <p className="text-sm text-gray-500 mt-3">{apiMessage}</p>
          )}
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#6B8A62]/10 rounded-full">
            <FiMail className="w-4 h-4 text-[#6B8A62]" />
            <span className="text-sm text-gray-600">
              Updates for <span className="font-medium text-[#6B8A62]">{formData.email}</span>
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-4 max-w-lg mx-auto">
            {getStatusHelperText(status)}
          </p>
        </div>

        {/* Printable Ticket UI */}
        <div ref={ticketRef} className="mb-8">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
            {/* Ticket Header with Emerald Gradient */}
            <div className="bg-gradient-to-r from-[#6B8A62] to-[#5A7352] px-6 py-4 relative">
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -mr-16 -mt-16"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full -ml-16 -mb-16"></div>
              </div>
              <div className="flex items-center justify-between relative">
                <div>
                  <p className="text-[#6B8A62]/80 text-xs uppercase tracking-wider">Reservation Request</p>
                  <p className="text-white font-mono font-semibold text-xl mt-1">{bookingId}</p>
                </div>
                <div className="text-right">
                  <p className="text-[#6B8A62]/80 text-xs uppercase tracking-wider">Booked On</p>
                  <p className="text-white text-sm font-medium mt-1">
                    {bookingDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-6">
              <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Section - Main Info */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Restaurant Profile */}
                  <div className="flex gap-4 pb-6 border-b border-gray-100">
                    <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 shadow-md">
                      <img src={restaurantData.image} alt={restaurantData.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">{restaurantData.name}</h2>
                      <p className="text-[#6B8A62] text-sm font-medium mt-0.5">{restaurantData.cuisine} • Fine Dining</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FiMapPin className="w-3.5 h-3.5 text-[#6B8A62]" />
                          {restaurantData.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <FiStar className="w-3.5 h-3.5 fill-[#6B8A62] stroke-[#6B8A62]" />
                          <span className="font-medium text-gray-700">{restaurantData.rating}</span>
                          <span className="text-gray-400">(2.3k reviews)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[#6B8A62]/10 rounded-xl p-4 border border-[#6B8A62]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#6B8A62]/20 rounded-lg flex items-center justify-center">
                          <FiCalendar className="w-4 h-4 text-[#6B8A62]" />
                        </div>
                        <span className="text-xs font-medium text-[#6B8A62] uppercase tracking-wide">Date</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formData.date}</p>
                    </div>

                    <div className="bg-[#6B8A62]/10 rounded-xl p-4 border border-[#6B8A62]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#6B8A62]/20 rounded-lg flex items-center justify-center">
                          <FiClock className="w-4 h-4 text-[#6B8A62]" />
                        </div>
                        <span className="text-xs font-medium text-[#6B8A62] uppercase tracking-wide">Time</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formData.time}</p>
                    </div>

                    <div className="bg-[#6B8A62]/10 rounded-xl p-4 border border-[#6B8A62]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#6B8A62]/20 rounded-lg flex items-center justify-center">
                          <FiUsers className="w-4 h-4 text-[#6B8A62]" />
                        </div>
                        <span className="text-xs font-medium text-[#6B8A62] uppercase tracking-wide">Party Size</span>
                      </div>
                      <p className="font-semibold text-gray-900">{formData.partySize} {formData.partySize === 1 ? 'Guest' : 'Guests'}</p>
                    </div>

                    <div className="bg-[#6B8A62]/10 rounded-xl p-4 border border-[#6B8A62]/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-[#6B8A62]/20 rounded-lg flex items-center justify-center">
                          <FiCoffee className="w-4 h-4 text-[#6B8A62]" />
                        </div>
                        <span className="text-xs font-medium text-[#6B8A62] uppercase tracking-wide">Seating</span>
                      </div>
                      <p className="font-semibold text-gray-900 capitalize">{formData.seatingPreference}</p>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contact Information</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-2">
                        <FiMail className="w-4 h-4 text-[#6B8A62]" />
                        <span className="text-sm text-gray-700">{formData.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FiPhone className="w-4 h-4 text-[#6B8A62]" />
                        <span className="text-sm text-gray-700">{formData.phone}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Section - QR & Order */}
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="bg-gradient-to-br from-gray-50 to-[#6B8A62]/10 rounded-xl p-5 text-center border border-[#6B8A62]/20">
                    <div className="flex justify-center mb-3">
                      <div className="w-32 h-32 bg-white rounded-xl shadow-md flex items-center justify-center">
                        <BsQrCode className="w-24 h-24 text-gray-800" />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Scan to Check-in</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {isPending
                        ? 'QR activates after staff approves your request'
                        : 'Present this QR code at the restaurant'}
                    </p>
                  </div>

                  {/* Order Summary */}
                  {orderedFood.length > 0 && (
                    <div className="bg-white rounded-xl border border-gray-100 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FiGift className="w-4 h-4 text-[#6B8A62]" />
                        <h3 className="font-semibold text-gray-900 text-sm">Pre-Order Summary</h3>
                      </div>
                      <div className="space-y-2 mb-3">
                        {orderedFood.map((item) => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-gray-600">{item.quantity ?? 1}x {item.name}</span>
                            <span className="font-medium text-gray-900">${(item.price * (item.quantity ?? 1)).toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex justify-between font-semibold">
                          <span className="text-gray-900">Total</span>
                          <span className="text-[#6B8A62]">${foodTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Status Badge */}
                  {depositPaid ? (
                    <div className="bg-[#6B8A62]/10 rounded-xl p-3 flex items-center gap-3 border border-[#6B8A62]/30">
                      <FiCreditCard className="w-5 h-5 text-[#6B8A62]" />
                      <div>
                        <p className="text-xs font-semibold text-[#6B8A62]">Deposit Paid</p>
                        <p className="text-xs text-[#6B8A62]">${depositAmount.toFixed(2)} charged</p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
                      <FiCreditCard className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-xs font-semibold text-gray-700">Pay at Restaurant</p>
                        <p className="text-xs text-gray-500">${foodTotal.toFixed(2)} due</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Ticket Footer */}
              <div className="mt-6 pt-6 border-t-2 border-dashed border-gray-200">
                <div className="flex flex-wrap justify-between items-center gap-3 text-xs text-gray-400">
                  <span>Please arrive 10 minutes before your reservation time</span>
                  <span>Table held for 15 minutes</span>
                  <span>Free cancellation up to 24 hours prior</span>
                </div>
              </div>
            </div>

            {/* Ticket Perforation Effect */}
            <div className="h-2 bg-gradient-to-r from-transparent via-[#6B8A62]/30 to-transparent"></div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#6B8A62] hover:bg-[#5A7352] text-white rounded-xl text-sm font-medium transition-all shadow-md hover:shadow-lg flex items-center gap-2"
          >
            <FiPrinter className="w-4 h-4" />
            Print Ticket
          </button>
          <button
            onClick={() => {}}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200 shadow-sm flex items-center gap-2"
          >
            <FiShare2 className="w-4 h-4" />
            Share
          </button>
          <Link
            to={APP_ROUTES.myReservations}
            className="px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-sm font-medium transition-all shadow-md flex items-center gap-2"
          >
            View My Reservations
          </Link>
          <button
            type="button"
            onClick={() => navigate(APP_ROUTES.spots)}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-sm font-medium transition-all border border-gray-200 shadow-sm flex items-center gap-2"
          >
            <FiArrowLeft className="w-4 h-4" />
            Book another table
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Staff receive your request instantly. Status updates automatically on My Reservations when
          they approve or decline.
        </p>
      </div>
    </div>
  );
}
