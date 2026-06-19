import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import PaymentForm from './PaymentForm';
import { 
  FaUsers, 
  FaUtensils, 
  FaHeart,
  FaMapMarkerAlt,
  FaStar,
  FaChevronLeft,
  FaCreditCard,
  FaInfoCircle,
  FaRegClock,
  FaPhone,
  FaChair,
  FaShieldAlt,
  FaSmile,
  FaCrown,
  FaBirthdayCake,
  FaBriefcase,
  FaEye,
  FaSun,
  FaCheck
} from 'react-icons/fa';
import FoodOrderingStep from './FoodOrderingStep';
import { createReservationRequest } from '../../services/reservation';
import { getAvailableTables } from '../../services/table';
import { useAuth } from '../../contexts/AuthContext';
import { combineDateAndTime, toApiDateTime } from '../../lib/reservation-datetime';
import { APP_ROUTES } from '../../constants/routes';

const ALL_TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 10; h <= 22; h++) {
    const mins = h === 22 ? [0] : [0, 30];
    for (const m of mins) {
      const h12 = h === 12 ? 12 : h > 12 ? h - 12 : h;
      const ampm = h < 12 ? 'AM' : 'PM';
      slots.push(`${h12}:${m === 0 ? '00' : '30'} ${ampm}`);
    }
  }
  return slots;
})();

export default function ReservationPage() {
  interface ReservationFormData {
    partySize: number | '9+' | '';
    date: string;
    time: string;
    durationHours: number;
    occasion: string;
    seatingPreference: string;
    allergies: string;
    specialRequests: string;
    reminder: boolean;
    smsReminder: boolean;
    email: string;
    skipFoodOrdering: boolean;
  }

  type ReservationErrors = Partial<Record<keyof ReservationFormData, string>>;

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const restaurantData = location.state?.restaurant || {
    id: 0,
    name: "L'Ulivo - Italian Restaurant Cairo",
    cuisine: "Italian • Mediterranean",
    rating: 4.7,
    reviewCount: 1234,
    location: "Cairo, Egypt",
    priceRange: "$$$",
    image: "https://images.unsplash.com/photo-1555396273-357c3479d8f8?w=800&h=600&fit=crop"
  };
  
  const [step, setStep] = useState(1);
  type OrderedFoodItem = {
    id: number;
    name: string;
    price: number;
    quantity?: number;
    description?: string;
    category?: string;
  };

  const [orderedFood, setOrderedFood] = useState<OrderedFoodItem[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [formData, setFormData] = useState<ReservationFormData>({
    partySize: '',
    date: '',
    time: '',
    durationHours: 2,
    occasion: '',
    seatingPreference: '',
    allergies: '',
    specialRequests: '',
    reminder: true,
    smsReminder: false,
    email: user?.email || '',
    skipFoodOrdering: false,
  });
  useEffect(() => {
    if (user?.email) {
      setFormData((prev) => ({ ...prev, email: user.email }));
    }
  }, [user?.email]);

  useEffect(() => {
    const date = formData.date;
    const partySize = formData.partySize;
    const durationHours = formData.durationHours;
    const selectedTime = formData.time;

    if (!date || !partySize) {
      setTimeSlots(ALL_TIME_SLOTS.map(time => ({ time, available: true })));
      return;
    }

    let cancelled = false;
    setSlotsLoading(true);

    const numberOfGuests = partySize === '9+' ? 10 : Number(partySize);
    const now = new Date();
    const isToday = new Date(date).toDateString() === now.toDateString();

    void (async () => {
      const results = await Promise.all(
        ALL_TIME_SLOTS.map(async (time): Promise<{ time: string; available: boolean }> => {
          try {
            const start = combineDateAndTime(date, time);
            if (isToday && start <= now) return { time, available: false };
            const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
            const res = await getAvailableTables({
              guests: numberOfGuests,
              start: toApiDateTime(start),
              end: toApiDateTime(end),
              pageSize: 1,
            });
            return { time, available: res.succeeded && (res.data?.count ?? 0) > 0 };
          } catch {
            return { time, available: true };
          }
        })
      );
      if (!cancelled) {
        setTimeSlots(results);
        setSlotsLoading(false);
        if (selectedTime) {
          const slot = results.find(s => s.time === selectedTime);
          if (slot && !slot.available) {
            setFormData(prev => ({ ...prev, time: '' }));
          }
        }
      }
    })();

    return () => { cancelled = true; };
  }, [formData.date, formData.partySize, formData.durationHours]);


  const [errors, setErrors] = useState<ReservationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  // Generate next 60 days for date selection (about 2 months)
  const generateDateOptions = () => {
    const dates = [];
    for (let i = 0; i < 60; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const [timeSlots, setTimeSlots] = useState<{ time: string; available: boolean }[]>(
    ALL_TIME_SLOTS.map(time => ({ time, available: true }))
  );
  const [slotsLoading, setSlotsLoading] = useState(false);

  const occasions = [
    { value: 'birthday', label: '🎂 Birthday', icon: FaBirthdayCake },
    { value: 'anniversary', label: '💝 Anniversary', icon: FaHeart },
    { value: 'date', label: '💑 Date Night', icon: FaSmile },
    { value: 'business', label: '💼 Business Meal', icon: FaBriefcase },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family Gathering', icon: FaUsers },
    { value: 'celebration', label: '🎉 Celebration', icon: FaCrown }
  ];

  const seatingPreferences = [
    { value: 'indoor', label: 'Indoor Seating', icon: FaChair, description: 'Climate controlled comfort' },
    { value: 'outdoor', label: 'Outdoor Patio', icon: FaSun, description: 'Weather permitting' },
    { value: 'window', label: 'Window View', icon: FaEye, description: 'Premium location' },
    { value: 'private', label: 'Private Room', icon: FaShieldAlt, description: 'Extra privacy' }
  ];

  const validateStep1 = () => {
    const newErrors: ReservationErrors = {};
    if (!formData.partySize) newErrors.partySize = 'Please select party size';
    if (!formData.date) newErrors.date = 'Please select a date';
    if (!formData.time) newErrors.time = 'Please select a time';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: ReservationErrors = {};
    if (!formData.email) {
      newErrors.email = 'Please login to submit a reservation request.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (step === 1) {
      if (!validateStep1()) return;

      setIsCheckingAvailability(true);
      try {
        const numberOfGuests = formData.partySize === '9+' ? 10 : Number(formData.partySize);
        const start = combineDateAndTime(formData.date, formData.time);
        const end = new Date(start.getTime() + formData.durationHours * 60 * 60 * 1000);

        const result = await getAvailableTables({
          guests: numberOfGuests,
          start: toApiDateTime(start),
          end: toApiDateTime(end),
          pageSize: 1,
        });

        if (result.succeeded && result.data && result.data.count === 0) {
          setErrors(prev => ({ ...prev, time: 'No tables available for the selected time and party size. Please choose a different time.' }));
          return;
        }
      } catch {
        // If the availability check itself fails, let the user proceed — the backend
        // will reject the reservation if truly no table is available.
      } finally {
        setIsCheckingAvailability(false);
      }

      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateStep2()) return;
    
    // Check if user is authenticated
    if (!user || !user.token) {
      alert('Please login to create a reservation.');
      navigate('/login');
      return;
    }
    
    // If food is ordered, payment must be completed first
    if (orderedFood.length > 0 && !paymentCompleted) {
      setShowPayment(true);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const restaurantId = Number(restaurantData.id);
      if (!Number.isFinite(restaurantId) || restaurantId <= 0) {
        throw new Error('Please choose a valid restaurant before making a reservation.');
      }

      const numberOfGuests = formData.partySize === '9+' ? 10 : Number(formData.partySize);
      if (!Number.isFinite(numberOfGuests) || numberOfGuests <= 0) {
        throw new Error('Please select a valid number of guests.');
      }

      const start = combineDateAndTime(formData.date, formData.time);
      const end = new Date(start.getTime() + formData.durationHours * 60 * 60 * 1000);
      const notes = [
        formData.specialRequests && `Requests: ${formData.specialRequests}`,
        formData.allergies && `Allergies: ${formData.allergies}`,
        formData.occasion && `Occasion: ${formData.occasion}`,
        formData.seatingPreference && `Seating: ${formData.seatingPreference}`,
      ]
        .filter(Boolean)
        .join(' | ');

      const payload = {
        restaurantId,
        startDateTime: toApiDateTime(start),
        endDateTime: toApiDateTime(end),
        numberOfGuests,
        notes: notes || 'No special requests',
      };

      const { response } = await createReservationRequest(payload);

      if (!response.succeeded) {
        throw new Error(response.message || response.errors?.[0] || 'Failed to create reservation');
      }

      setIsSubmitting(false);
      navigate(APP_ROUTES.myReservations, {
        state: {
          reservationCreated: true,
          apiMessage: response.message,
        },
      });
    } catch (error) {
      setIsSubmitting(false);
      const message = error instanceof Error ? error.message : 'Failed to create reservation';
      alert(message);
    }
  };

  const handleFoodOrderUpdate = useCallback((foodItems: OrderedFoodItem[]) => {
    setOrderedFood(foodItems);
  }, []);

  const handlePaymentComplete = () => {
    setPaymentCompleted(true);
    setShowPayment(false);
  };

  const handlePaymentCancel = () => {
    setShowPayment(false);
  };

  const calculateFoodTotal = () => {
    return orderedFood.reduce((total, item) => total + item.price * (item.quantity ?? 1), 0);
  };

  const handleInputChange = <K extends keyof ReservationFormData>(field: K, value: ReservationFormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => step === 1 ? navigate('/') : handleBack()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
            >
              <FaChevronLeft className="text-lg" />
              <span>{step === 1 ? 'Back' : 'Previous'}</span>
            </button>
            <div className="flex items-center gap-3">
              <div className={`text-sm ${step >= 1 ? 'text-[#6B8A62]' : 'text-gray-400'}`}>
                Step {step} of 3
              </div>
              <div className="w-24 h-1 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#6B8A62] transition-all duration-300"
                  style={{ width: `${(step / 3) * 100}%` }}
                />
              </div>
            </div>
            <div className="w-20"></div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left Column - Restaurant Info */}
          <div className="lg:w-1/3">
            <div className="sticky top-24">
              {/* Restaurant Card */}
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="relative h-48">
                  <img 
                    src={restaurantData.image}
                    alt={restaurantData.name}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md hover:scale-110 transition">
                    <FaHeart className="text-gray-400 hover:text-red-500" />
                  </button>
                </div>
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">{restaurantData.name}</h2>
                  <p className="text-gray-600 text-sm mb-3">{restaurantData.cuisine}</p>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400 text-sm" />
                      <span className="font-semibold text-sm">{restaurantData.rating}</span>
                      <span className="text-gray-400 text-xs">({restaurantData.reviewCount}+)</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-gray-400 text-sm" />
                      <span className="text-sm text-gray-600">{restaurantData.location}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaUtensils className="text-[#6B8A62]" />
                      <span>Italian • Mediterranean • Seafood</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaRegClock className="text-[#6B8A62]" />
                      <span>Open Today: 12:00 PM - 11:00 PM</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FaPhone className="text-[#6B8A62]" />
                      <span>+20 123 456 7890</span>
                    </div>
                  </div>

                  <div className="mt-4 bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 flex items-start gap-2">
                      <FaInfoCircle className="mt-0.5 flex-shrink-0" />
                      Cancellation Policy: Free cancellation up to 2 hours before your reservation.
                    </p>
                  </div>
                </div>
              </div>

              {/* Tips Card */}
              <div className="mt-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-4 border border-amber-100">
                <p className="text-sm font-medium text-amber-800 mb-1">✨ Pro Tip</p>
                <p className="text-xs text-amber-700">Popular times for this restaurant are 7:00 PM - 8:30 PM. Book early!</p>
              </div>
            </div>
          </div>

          {/* Right Column - Reservation Form */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
              {step === 1 ? (
                // Step 1: Booking Details
                <div className="space-y-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Make a <span className='text-[#6B8A62]'>Reservation</span></h1>
                  </div>

                  {/* Party Size */}
                  <div>
                    <label className="block text-sm font-semibold text-[#6B8A62] mb-3">
                      What is your Party Size?
                    </label>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                      {[1,2,3,4,5,6,7,8].map(num => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleInputChange('partySize', num)}
                          className={`flex flex-col items-center gap-1 py-3 rounded-lg border-2 transition-all ${
                            formData.partySize === num
                              ? 'border-[#6B8A62] bg-[#6B8A62]/10 text-[#6B8A62]'
                              : 'border-gray-200 hover:border-[#6B8A62] text-gray-600'
                          }`}
                        >
                          <FaUsers className="text-lg" />
                          <span className="text-sm font-medium">{num}</span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleInputChange('partySize', '9+')}
                        className={`py-3 rounded-lg border-2 transition-all col-span-2 ${
                          formData.partySize === '9+'
                            ? 'border-[#6B8A62] bg-[#6B8A62]/10 text-[#6B8A62]'
                            : 'border-gray-200 hover:border-[#6B8A62] text-gray-600'
                        }`}
                      >
                        9+ Guests
                      </button>
                    </div>
                    {errors.partySize && <p className="mt-2 text-sm text-red-600">{errors.partySize}</p>}
                  </div>

                  {/* Date Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-[#6B8A62] mb-3">
                      Which Date would you like to reserve?
                    </label>
                    <div className="max-h-50 overflow-y-auto">
                      <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                        {generateDateOptions().map((date, idx) => {
                          const isSelected = formData.date === date.toDateString();
                          const isToday = idx === 0;
                          const isNewMonth = idx === 0 || date.getDate() === 1;
                          
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleInputChange('date', date.toDateString())}
                              className={`text-center py-3 px-2 rounded-lg border-2 transition-all ${
                                isSelected
                                  ? 'border-[#6B8A62] bg-[#6B8A62]/10 text-[#6B8A62]'
                                  : 'border-gray-200 hover:border-[#6B8A62]'
                              }`}
                            >
                              <div className="text-xs font-medium">
                                {date.toLocaleDateString('en-US', { weekday: 'short' })}
                              </div>
                              <div className="text-lg font-bold">
                                {date.getDate()}
                              </div>
                              <div className="text-xs">
                                {isToday ? 'Today' : date.toLocaleDateString('en-US', { month: 'short' })}
                              </div>
                              {isNewMonth && !isToday && (
                                <div className="text-xs font-semibold text-[#6B8A62] mt-1">
                                  {date.toLocaleDateString('en-US', { month: 'short' })}
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Scroll to see more dates • Showing next 60 days
                    </p>
                  </div>
                  {errors.date && <p className="mt-2 text-sm text-red-600">{errors.date}</p>}

                  {/* Time Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-[#6B8A62] mb-3 flex items-center gap-2">
                      Select Time
                      {slotsLoading && (
                        <span className="text-xs font-normal text-gray-400 animate-pulse">
                          Checking availability…
                        </span>
                      )}
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                      {timeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available || slotsLoading}
                          onClick={() => !slotsLoading && slot.available && handleInputChange('time', slot.time)}
                          className={`py-2 px-3 rounded-lg border-2 transition-all ${
                            formData.time === slot.time
                              ? 'border-[#6B8A62] bg-[#6B8A62]/10 text-[#6B8A62]'
                              : slot.available && !slotsLoading
                              ? 'border-gray-200 hover:border-[#6B8A62] text-gray-700'
                              : 'border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                          {!slot.available && !slotsLoading && <span className="text-xs block">Unavailable</span>}
                        </button>
                      ))}
                    </div>
                    {errors.time && <p className="mt-2 text-sm text-red-600">{errors.time}</p>}
                  </div>

                  {/* Duration Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-[#6B8A62] mb-3">
                      How long would you be staying?
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[1, 2, 3, 4].map((hours) => (
                        <button
                          key={hours}
                          type="button"
                          onClick={() => handleInputChange('durationHours', hours)}
                          className={`py-2 px-3 rounded-lg border-2 transition-all ${
                            formData.durationHours === hours
                              ? 'border-[#6B8A62] bg-[#6B8A62]/10 text-[#6B8A62]'
                              : 'border-gray-200 hover:border-[#6B8A62] text-gray-700'
                          }`}
                        >
                          {hours}h
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Occasion (Optional) */}
                  <div>
                    <label className="block text-sm font-semibold text-[#6B8A62] mb-3">
                      Are you here for an Occasion? (Optional)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {occasions.map((occasion) => (
                        <button
                          key={occasion.value}
                          type="button"
                          onClick={() => handleInputChange('occasion', occasion.value)}
                          className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg border transition-all ${
                            formData.occasion === occasion.value
                              ? 'border-[#6B8A62] bg-[#6B8A62]/10 text-[#6B8A62]'
                              : 'border-gray-200 hover:border-[#6B8A62] text-gray-600'
                          }`}
                        >
                          <span className="text-sm">{occasion.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Seating Preference */}
                  <div>
                    <label className="block text-sm font-semibold text-[#6B8A62] mb-3">
                      Do you have a Seating Preference? (Optional)
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {seatingPreferences.map((pref) => {
                        const IconComponent = pref.icon;
                        return (
                          <button
                            key={pref.value}
                            type="button"
                            onClick={() => handleInputChange('seatingPreference', pref.value)}
                            className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                              formData.seatingPreference === pref.value
                                ? 'border-[#6B8A62] bg-[#6B8A62]/10'
                                : 'border-gray-200 hover:border-[#6B8A62]'
                            }`}
                          >
                            <div className={`text-xl ${
                              formData.seatingPreference === pref.value ? 'text-[#6B8A62]' : 'text-gray-400'
                            }`}>
                              <IconComponent />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-sm">{pref.label}</div>
                              <div className="text-xs text-gray-500">{pref.description}</div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6">
                    <button
                      onClick={() => void handleNext()}
                      disabled={isCheckingAvailability}
                      className="w-full bg-[#6B8A62] hover:bg-[#5A7352] disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 duration-300 flex items-center justify-center gap-2"
                    >
                      {isCheckingAvailability ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Checking availability...
                        </>
                      ) : 'Next →'}
                    </button>
                  </div>
                </div>
              ) : step === 2 ? (
                // Step 2: Food Ordering (Optional)
                <div>
                  <FoodOrderingStep
                    onFoodOrderUpdate={handleFoodOrderUpdate}
                    partySize={typeof formData.partySize === 'number' ? formData.partySize : 1}
                    restaurantId={Number(restaurantData.id)}
                  />
                  
                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-all transform hover:scale-95 duration-300"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => void handleNext()}
                      className="flex-1 bg-[#6B8A62] hover:bg-[#5A7352] text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 duration-300"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              ) : (
                // Step 3: Final confirmation
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirm Your <span className='text-[#6B8A62]'>Booking</span></h1>
                  </div>

                  <div>
                    <div className="bg-[#6B8A62]/10 border border-[#6B8A62]/20 rounded-lg p-4 text-center">
                      <p className="text-sm font-medium text-gray-800">Request will be submitted as:</p>
                      <p className="text-sm text-[#6B8A62] mt-1">{formData.email || 'No account email found'}</p>
                    </div>
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#6B8A62] mb-2">
                      Any Special Requests? (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      placeholder="Dietary restrictions, allergies, or anything we should know?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#6B8A62] focus:border-[#6B8A62] outline-none transition"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.reminder}
                        onChange={(e) => handleInputChange('reminder', e.target.checked)}
                        className="w-4 h-4 text-[#6B8A62] border-gray-300 rounded focus:ring-[#6B8A62]"
                      />
                      <span className="text-sm text-gray-700">
                        📧 Send me email reminder 24 hours before
                      </span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.smsReminder}
                        onChange={(e) => handleInputChange('smsReminder', e.target.checked)}
                        className="w-4 h-4 text-[#6B8A62] border-gray-300 rounded focus:ring-[#6B8A62]"
                      />
                      <span className="text-sm text-gray-700">
                        📱 Send me SMS reminder 1 hour before
                      </span>
                    </label>
                  </div>

                  <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                  {/* Header */}
                  <div className="bg-[#6B8A62] px-5 py-3">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-white">Booking Summary</h3>
                      <span className="text-xs text-[#6B8A62]/80 bg-white/20 px-2 py-1 rounded-full">
                        Tax included
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 space-y-4">
                    {/* Restaurant & Date */}
                    <div className="flex justify-between items-start border-b border-gray-200 pb-3">
                      <div>
                        <p className="font-bold text-gray-900 text-lg">{restaurantData.name}</p>
                      </div>
                      <div className=" text-center">
                        <p className="font-semibold text-gray-900">{formData.date}</p>
                        <p className="text-xs text-gray-500">{formData.time}</p>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-2 gap-3 bg-gray-100/50 rounded-lg p-3">
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Party Size</p>
                        <p className="text-lg font-bold text-gray-900">{formData.partySize} {formData.partySize === 1 ? 'person' : 'people'}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Duration</p>
                        <p className="text-lg font-bold text-gray-900">
                          {formData.durationHours}
                          <span className="text-xs font-normal text-gray-500 ml-1">
                            ({formData.durationHours === 1 ? 'hour' : 'hours'})
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Food Order Section */}
                    {orderedFood.length > 0 && (
                      <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🍽️</span>
                            <span className="font-semibold text-gray-800">Food Order</span>
                          </div>
                          <span className="text-xs bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                            {orderedFood.length} {orderedFood.length === 1 ? 'item' : 'items'}
                          </span>
                        </div>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {orderedFood.map((item) => (
                            <div key={item.id} className="flex justify-between items-center text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-600 min-w-[24px]">{item.quantity ?? 1}×</span>
                                <span className="text-gray-700">{item.name}</span>
                              </div>
                              <span className="font-medium text-gray-800">
                                ${(item.price * (item.quantity ?? 1)).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        <div className="border-t border-amber-200 mt-3 pt-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-semibold text-gray-800">Food Subtotal</span>
                            <span className="text-lg font-bold text-[#6B8A62]">
                              ${calculateFoodTotal().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Total Section */}
                    <div className="bg-[#6B8A62]/10 rounded-lg p-4 border border-[#6B8A62]/20">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-bold text-gray-900">
                            {orderedFood.length > 0 ? 'Total (incl. food)' : 'Total to pay'}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {orderedFood.length > 0 
                              ? 'Includes all items' 
                              : 'No booking fee required'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-[#6B8A62]">
                            {orderedFood.length > 0 
                              ? `$${calculateFoodTotal().toFixed(2)}`
                              : '$0.00'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Small Print */}
                    <p className="text-xs text-gray-400 text-center pt-2 border-t border-gray-200">
                      Reservation requires admin approval. You'll receive confirmation via email.
                    </p>
                  </div>
                </div>

                  {/* Payment Options for Food Orders */}
                  {orderedFood.length > 0 && !paymentCompleted && (
                    <div className="bg-[#6B8A62]/10 rounded-lg p-4 border border-[#6B8A62]/20">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-[#6B8A62]">Required Deposit</h4>
                          <p className="text-sm text-[#6B8A62]">50% deposit required for pre-orders</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-[#6B8A62]">${(calculateFoodTotal() * 0.5).toFixed(2)}</p>
                          <p className="text-xs text-[#6B8A62]">Deposit amount</p>
                        </div>
                      </div>
                      <div className="bg-[#6B8A62]/20 rounded-lg p-3 mb-3">
                        <p className="text-sm text-[#6B8A62]">
                          <strong>Note:</strong> A 50% deposit is required for all food orders. Payment does not auto-confirm the reservation; admin approval is still required.
                        </p>
                      </div>
                      {!showPayment ? (
                        <button
                          type="button"
                          onClick={() => setShowPayment(true)}
                          className="w-full bg-[#6B8A62] hover:bg-[#5A7352] text-white py-2 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <FaCreditCard className="text-sm" />
                          Pay Deposit Now
                        </button>
                      ) : (
                        <div className="text-center py-2">
                          <p className="text-sm text-[#6B8A62] font-medium">Please complete payment below</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Payment Success */}
                  {orderedFood.length > 0 && paymentCompleted && (
                    <div className="bg-[#6B8A62]/20 rounded-lg p-4 border border-[#6B8A62]/30">
                      <div className="flex items-center gap-2 text-[#6B8A62]">
                        <FaCreditCard className="text-lg" />
                        <div>
                          <p className="font-semibold">Deposit Paid</p>
                          <p className="text-sm">${(calculateFoodTotal() * 0.5).toFixed(2)} deposit charged successfully</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Payment Form */}
                  {showPayment && (
                    <PaymentForm
                      amount={calculateFoodTotal()}
                      onPaymentComplete={handlePaymentComplete}
                      onCancel={handlePaymentCancel}
                    />
                  )}

                  <div className="flex gap-4 pt-6">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 rounded-lg font-semibold transition-all transform hover:scale-95 duration-300"
                      disabled={showPayment}
                    >
                      Back
                    </button>
                    {!showPayment && (
                      <button
                        type="submit"
                        disabled={isSubmitting || (orderedFood.length > 0 && !paymentCompleted)}
                        className="flex-1 bg-[#6B8A62] hover:bg-[#5A7352] disabled:bg-gray-300 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105 duration-300 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Processing...
                          </>
                        ) : (
                          <>
                            {orderedFood.length > 0 && !paymentCompleted ? (
                              <>
                                <FaCreditCard />
                                Complete Reservation
                              </>
                            ) : (
                              <>
                                <FaCheck className="text-lg" />
                                Submit Reservation Request
                              </>
                            )}
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}