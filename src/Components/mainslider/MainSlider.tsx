import { useState, useEffect, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt, FaChevronRight, FaChevronLeft, FaTimes, FaClock, FaPhoneAlt, FaSpinner } from 'react-icons/fa';
import type { CustomArrowProps } from 'react-slick';
import { Button } from 'flowbite-react';
import ProtectedButton from '../auth/ProtectedButton';
import { Link } from 'react-router-dom';
import { getAllRestaurants } from '../../services/restaurant';
import { getFavorites, addFavorite, removeFavorite } from '../../services/favorite';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';
import type { ReturnRestaurantQuery } from '../../types/restaurant';


// ✅ Custom Arrows
function NextArrow(props: CustomArrowProps) {
  const { onClick } = props;
  return (
    <div
      className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 z-20 cursor-pointer"
      onClick={onClick}
    >
      <FaChevronRight className="text-[#6B8A62] hover:text-[#5A7352] transition text-2xl" />
    </div>
  );
}

function PrevArrow(props: CustomArrowProps) {
  const { onClick } = props;
  return (
    <div
      className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 z-20 cursor-pointer"
      onClick={onClick}
    >
      <FaChevronLeft className="text-[#6B8A62] hover:text-[#5A7352] transition text-2xl" />
    </div>
  );
}


interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  image: string;
  location: string;
  deliveryTime: string;
  isFavorite: boolean;
  discount: string | null;
  description?: string;
  address?: string;
  phone?: string;
  hours?: string;
  features?: string[];
}

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop';

function restaurantQueryToSlide(r: ReturnRestaurantQuery): Restaurant {
  return {
    id: r.id,
    name: r.name,
    cuisine: r.cuisine || 'Restaurant',
    rating: r.rating,
    reviewCount: r.reviewCount,
    priceRange: r.priceRange || '$$',
    image: r.image || DEFAULT_IMAGE,
    location: r.location || r.address || '',
    deliveryTime: r.hours || 'Hours not listed',
    isFavorite: false,
    discount: null,
    description: r.description,
    address: r.address,
    phone: r.phone,
    hours: r.hours,
    features: r.features,
  };
}

interface SliderRestaurantModalProps {
  restaurant: Restaurant | null;
  onClose: () => void;
  isFavorite: boolean;
  onFavoriteToggle: (id: number) => void;
  onReserve: (restaurant: Restaurant) => void;
}

const SliderRestaurantModal: FC<SliderRestaurantModalProps> = ({
  restaurant,
  onClose,
  isFavorite,
  onFavoriteToggle,
  onReserve,
}) => {
  if (!restaurant) return null;

  const description =
    restaurant.description?.trim() ||
    `${restaurant.name} — ${restaurant.cuisine.replace(/^•\s*/, '').trim()}. Located in ${restaurant.location}.`;
  const address = restaurant.address?.trim() || restaurant.location;
  const hoursLabel = restaurant.hours?.trim() || `Typical wait: ${restaurant.deliveryTime}`;
  const phone = restaurant.phone?.trim() || '—';
  const features =
    restaurant.features?.length ? restaurant.features : restaurant.discount ? [restaurant.discount] : [];

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[90%] md:max-w-[50%] lg:max-w-[45%] xl:max-w-[40%] max-h-[90vh] overflow-y-auto">
        <div className="relative h-56 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
          <img src={restaurant.image} alt={restaurant.name} className="w-full h-full object-cover" />

          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-105"
            aria-label="Close"
          >
            <FaTimes className="text-sm" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(restaurant.id);
            }}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200"
            aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          >
            {isFavorite ? <FaHeart className="text-red-500 text-sm" /> : <FaRegHeart className="text-gray-600 text-sm" />}
          </button>
        </div>

        <div className="p-5 md:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{restaurant.name}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-[#6B8A62]/10 px-2 py-0.5 rounded-md">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-sm font-semibold text-gray-800">{restaurant.rating}</span>
                  <span className="text-xs text-gray-500">({restaurant.reviewCount})</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm font-medium text-[#6B8A62]">{restaurant.priceRange}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 capitalize">restaurant</span>
              </div>
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed mb-5">{description}</p>

          <div className="space-y-3 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt className="text-[#6B8A62] text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-gray-800">{restaurant.location}</p>
                <p className="text-xs text-gray-500">{address}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-[#6B8A62] text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Service</p>
                  <p className="text-sm text-gray-800">{hoursLabel}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt className="text-[#6B8A62] text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm text-gray-800 truncate">{phone}</p>
                </div>
              </div>
            </div>
          </div>

          {features.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>✨</span> Amenities & offers
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {features.map((feature, idx) => (
                  <span key={idx} className="px-2.5 py-1 bg-gray-100 rounded-md text-xs text-gray-600 font-medium">
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <ProtectedButton
              className="w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-2.5 rounded-lg hover:shadow-lg hover:scale-102 transition-all duration-300 font-semibold flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => {
                onReserve(restaurant);
                onClose();
              }}
            >
              Make a Reservation
            </ProtectedButton>
          </div>

          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700 flex items-center gap-1.5">
              <span className="text-base">💡</span>
              Popular times: 7–8 PM
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Restaurant Card Component
function RestaurantCard({
  restaurant,
  onFavoriteToggle,
  onViewDetails,
}: {
  restaurant: Restaurant;
  onFavoriteToggle: (id: number) => void;
  onViewDetails: (restaurant: Restaurant) => void;
}) {
  return (
    <div className="px-2 py-2">
      <div 
        className="bg-gray-50 rounded-xl overflow-hidden transition-all duration-300 border-1 border-gray-200 hover:-translate-y-1 transition-all cursor-pointer"
      >
        {/* Image Section */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={restaurant.image} 
            alt={restaurant.name}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          />
          
          {/* Discount Badge */}
          {restaurant.discount && (
            <div className="absolute top-3 left-3 bg-[#6B8A62] text-white px-2 py-1 rounded-md text-xs font-bold">
              {restaurant.discount}
            </div>
          )}
          
          {/* Favorite Button */}
          <button
            onClick={() => onFavoriteToggle(restaurant.id)}
            className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md hover:scale-110 transition-transform z-10"
          >
            {restaurant.isFavorite ? (
              <FaHeart className="text-red-600 text-xl" />
            ) : (
              <FaRegHeart className="text-gray-600 text-xl" />
            )}
          </button>

          {/* Rating Badge */}
          <div className="absolute bottom-3 left-3 bg-gray-900 bg-opacity-75 text-white px-2 py-1 rounded-md text-sm flex items-center gap-1">
            <FaStar className="text-yellow-400 text-xs" />
            <span className="font-semibold">{restaurant.rating}</span>
            <span className="text-xs text-gray-300">({restaurant.reviewCount})</span>
          </div>

          {/* Delivery Time */}
          <div className="absolute bottom-3 right-3 bg-white bg-opacity-90 px-2 py-1 rounded-md text-xs font-medium">
             {restaurant.deliveryTime}
          </div>
        </div>

        {/* Content Section */}
        <div className="p-4">
          <h3 className="text-lg font-bold text-gray-800 mb-1 line-clamp-1">
            {restaurant.name}
          </h3>
          
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm text-gray-600 line-clamp-1">
              {restaurant.cuisine}
            </p>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-1">
              <FaMapMarkerAlt className="text-gray-400 text-xs" />
              <span className="text-xs text-gray-500">
                {restaurant.location}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-sm font-semibold text-[#6B8A62]">
                {restaurant.priceRange}
              </span>
            </div>
          </div>

          <Button
            onClick={() => onViewDetails(restaurant)}
            className="w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-2.5 rounded-lg hover:shadow-lg hover:scale-102 transition-all duration-300 font-semibold flex items-center justify-center gap-2 cursor-pointer"
          >
            View Details
          </Button>
        </div>
      </div>
    </div>
  );
}

// Main Carousel Component
export default function MainSlider() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchRestaurants() {
      try {
        setIsLoading(true);
        setError(null);
        const result = await getAllRestaurants(1, 50);
        if (!cancelled) {
          setRestaurants(result.restaurants.filter((r) => r.isActive).map(restaurantQueryToSlide));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load restaurants');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchRestaurants();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    getFavorites()
      .then((response) => {
        if (cancelled) return;
        const favoriteIds = new Set((response.data ?? []).map((f) => f.restaurantId));
        setRestaurants((prev) => prev.map((r) => ({ ...r, isFavorite: favoriteIds.has(r.id) })));
      })
      .catch(() => { /* favorites are a nice-to-have; ignore load failures */ });

    return () => { cancelled = true; };
  }, [user, restaurants.length]);

  // Slider configuration
  const settings = {
    dots: true,
    infinite: true,
    speed: 400,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    cssEase: "linear",
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      { breakpoint: 1280, settings: { slidesToShow: 3, slidesToScroll: 1 } },
      { breakpoint: 1024, settings: { slidesToShow: 2, slidesToScroll: 1 } },
      { breakpoint: 640, settings: { slidesToShow: 1, slidesToScroll: 1 } }
    ]
  };

  // Toggle favorite status
  const handleFavoriteToggle = (restaurantId: number) => {
    if (!user) {
      navigate(APP_ROUTES.login);
      return;
    }

    const restaurant = restaurants.find(r => r.id === restaurantId);
    const wasFavorite = !!restaurant?.isFavorite;

    setRestaurants(prevRestaurants =>
      prevRestaurants.map(restaurant =>
        restaurant.id === restaurantId
          ? { ...restaurant, isFavorite: !restaurant.isFavorite }
          : restaurant
      )
    );

    const request = wasFavorite ? removeFavorite(restaurantId) : addFavorite(restaurantId);
    request.catch(() => {
      // Revert on failure since the optimistic update above didn't stick server-side.
      setRestaurants(prevRestaurants =>
        prevRestaurants.map(r => r.id === restaurantId ? { ...r, isFavorite: wasFavorite } : r)
      );
      setShowNotification(`Failed to update favorites for ${restaurant?.name}`);
      setTimeout(() => setShowNotification(null), 2000);
      return;
    });

    const action = wasFavorite ? 'removed from' : 'added to';

    setShowNotification(`${restaurant?.name} ${action} favorites!`);
    setTimeout(() => setShowNotification(null), 2000);
  };

  const handleReserve = (restaurant: Restaurant) => {
    navigate('/reservation', { state: { restaurant } });
  };

  return (
    <div className="bg-white py-12 border-b border-gray-200">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-12 relative">
        {/* Decorative emerald blobs */}
        <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#6B8A62]/10 rounded-full blur-2xl opacity-30 -z-10"></div>
        <div className="absolute right-1/4 bottom-0 w-40 h-40 bg-[#6B8A62]/10 rounded-full blur-2xl opacity-40 -z-10"></div>
        
        <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#6B8A62]/10 text-[#6B8A62] text-xs font-semibold rounded-full mb-4">
          <FaStar className="text-yellow-400 text-xs" />
          RECOMMENDED FOR YOU
          <FaStar className="text-yellow-400 text-xs" />
        </span>
        
        <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover <span className="text-[#6B8A62]">Trending</span> Tables
          </h2>
        
        <p className="text-gray-500 mx-auto">
          See where everyone's booking this month
        </p>
        
        {/* Animated arrow indicator */}
        <div className="flex justify-center mt-6">
          <div className="animate-bounce">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>
      </div>

        {/* Carousel */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <FaSpinner className="animate-spin text-3xl text-[#6B8A62]" />
          </div>
        ) : error ? (
          <p className="text-center text-red-500 py-12">{error}</p>
        ) : restaurants.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No spots available yet — check back soon!</p>
        ) : (
          <Slider {...settings}>
            {restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onFavoriteToggle={handleFavoriteToggle}
                onViewDetails={setSelectedRestaurant}
              />
            ))}
          </Slider>
        )}

        {selectedRestaurant && (
          <SliderRestaurantModal
            restaurant={selectedRestaurant}
            onClose={() => setSelectedRestaurant(null)}
            isFavorite={!!restaurants.find((r) => r.id === selectedRestaurant.id)?.isFavorite}
            onFavoriteToggle={handleFavoriteToggle}
            onReserve={handleReserve}
          />
        )}

        {/* Notification Toast */}
        {showNotification && (
          <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#6B8A62] text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-transform duration-300 ease-out animate-slide-up">
            {showNotification}
          </div>
        )}

         <div className="mt-12 text-center">
          <Link to= "/spots">
          <button className="border border-[#6B8A62] hover:scale-105 transition-all duration-300 text-[#6B8A62] px-8 py-3 rounded-lg font-bold">
            Check all Spots Now →
          </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
