import { useState, useMemo, useCallback, type FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaMapMarkerAlt, FaSearch, FaTimes, FaHeart, FaRegHeart, FaInfoCircle, FaPhoneAlt, FaClock } from 'react-icons/fa';
import { MdRestaurant, MdLocalCafe } from 'react-icons/md';
import { Card, Button, Badge, TextInput } from 'flowbite-react';
import ProtectedButton from '../auth/ProtectedButton';

// Enhanced mock data with more details and realistic images
const mockSpots = [
  // Restaurants
  {
    id: 1,
    name: "The Gourmet Kitchen",
    type: "restaurant",
    cuisine: "Italian",
    rating: 4.8,
    reviewCount: 342,
    priceRange: "$$$",
    location: "Downtown",
    address: "123 Culinary Ave, Downtown",
    phone: "(555) 123-4567",
    hours: "11:00 AM - 10:00 PM",
    website: "www.gourmetkitchen.com",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop",
    description: "Fine dining Italian restaurant with authentic pasta and wood-fired pizzas. Our chefs use only the freshest ingredients imported directly from Italy.",
    features: ["Outdoor Seating", "Wine Bar", "Private Events"]
  },
  {
    id: 2,
    name: "Sushi Master",
    type: "restaurant",
    cuisine: "Japanese",
    rating: 4.9,
    reviewCount: 528,
    priceRange: "$$$",
    location: "Midtown",
    address: "456 Sushi Lane, Midtown",
    phone: "(555) 234-5678",
    hours: "12:00 PM - 9:30 PM",
    website: "www.sushimaster.com",
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop",
    description: "Fresh sushi and traditional Japanese dishes. Experience the art of omakase from our master chefs with 20+ years of experience.",
    features: ["Omakase", "Sake Bar", "Private Rooms"]
  },
  {
    id: 3,
    name: "Burger House",
    type: "restaurant",
    cuisine: "American",
    rating: 4.5,
    reviewCount: 891,
    priceRange: "$$",
    location: "West End",
    address: "789 Burger Blvd, West End",
    phone: "(555) 345-6789",
    hours: "11:00 AM - 11:00 PM",
    website: "www.burgerhouse.com",
    image: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=600&h=400&fit=crop",
    description: "Gourmet burgers and craft beers. Our patties are made from premium Angus beef and served on freshly baked brioche buns.",
    features: ["Craft Beer", "Late Night", "Takeout"]
  },
  {
    id: 4,
    name: "Spice Garden",
    type: "restaurant",
    cuisine: "Indian",
    rating: 4.7,
    reviewCount: 267,
    priceRange: "$$",
    location: "East Side",
    address: "321 Spice Rd, East Side",
    phone: "(555) 456-7890",
    hours: "11:30 AM - 9:30 PM",
    website: "www.spicegarden.com",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=600&h=400&fit=crop",
    description: "Authentic Indian curries and tandoori dishes. Our recipes have been passed down through generations.",
    features: ["Vegan Options", "Gluten-Free", "Buffet"]
  },
  
  // Cafes
  {
    id: 5,
    name: "Starbucks Coffee",
    type: "cafe",
    specialty: "Coffee",
    rating: 4.3,
    reviewCount: 1256,
    priceRange: "$$",
    location: "Downtown",
    address: "888 Coffee Way, Downtown",
    phone: "(555) 567-8901",
    hours: "6:00 AM - 8:00 PM",
    website: "www.starbucks.com",
    image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop",
    description: "Premium coffee, pastries, and cozy atmosphere. Free WiFi and plenty of seating for remote work.",
    features: ["Free WiFi", "Outdoor Seating", "Drive-Thru"]
  },
  {
    id: 6,
    name: "The Book Cafe",
    type: "cafe",
    specialty: "Tea & Coffee",
    rating: 4.6,
    reviewCount: 432,
    priceRange: "$$",
    location: "Midtown",
    address: "456 Reading St, Midtown",
    phone: "(555) 678-9012",
    hours: "8:00 AM - 9:00 PM",
    website: "www.bookcafe.com",
    image: "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=600&h=400&fit=crop",
    description: "Coffee shop with a library, perfect for reading. Over 1000 books available for customers to enjoy.",
    features: ["Library", "Quiet Zone", "Board Games"]
  },
  {
    id: 7,
    name: "Artisan Bakery",
    type: "cafe",
    specialty: "Bakery",
    rating: 4.7,
    reviewCount: 578,
    priceRange: "$",
    location: "West End",
    address: "789 Fresh Bread Ave, West End",
    phone: "(555) 789-0123",
    hours: "7:00 AM - 7:00 PM",
    website: "www.artisanbakery.com",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=400&fit=crop",
    description: "Fresh bread, pastries, and specialty coffee. Baked fresh daily using organic ingredients.",
    features: ["Gluten-Free", "Vegan", "Take & Bake"]
  },
  {
    id: 8,
    name: "Green Leaf Cafe",
    type: "cafe",
    specialty: "Healthy",
    rating: 4.4,
    reviewCount: 312,
    priceRange: "$$",
    location: "East Side",
    address: "234 Health St, East Side",
    phone: "(555) 890-1234",
    hours: "7:30 AM - 8:00 PM",
    website: "www.greenleafcafe.com",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop",
    description: "Organic coffee and healthy breakfast options. All ingredients are locally sourced and organic.",
    features: ["Organic", "Acai Bowls", "Cold Pressed Juices"]
  }
];

type Spot = (typeof mockSpots)[number];

function spotToReservationRestaurant(spot: Spot) {
  const cuisineLabel =
    spot.type === 'restaurant' && 'cuisine' in spot && spot.cuisine
      ? spot.cuisine
      : spot.type === 'cafe' && 'specialty' in spot && spot.specialty
        ? `${spot.specialty} • Cafe`
        : spot.type === 'cafe'
          ? 'Cafe'
          : 'Restaurant';

  return {
    id: spot.id,
    name: spot.name,
    cuisine: cuisineLabel,
    rating: spot.rating,
    reviewCount: spot.reviewCount,
    priceRange: spot.priceRange,
    image: spot.image,
    location: spot.location,
    description: spot.description,
    address: spot.address,
    phone: spot.phone,
    hours: spot.hours,
    features: 'features' in spot && Array.isArray(spot.features) ? spot.features : [],
  };
}

interface SpotCardProps {
  spot: Spot;
  onClick: (spot: Spot) => void;
  isFavorite: boolean;
  onFavoriteToggle: (spotId: number) => void;
}

const SpotCard: FC<SpotCardProps> = ({ spot, onClick, isFavorite, onFavoriteToggle }) => (
  <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
    <div className="relative h-48 overflow-hidden">
      <img
        src={spot.image}
        alt={spot.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        loading="lazy"
      />
      <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm ${
        spot.type === 'restaurant' ? 'bg-red-700/90' : 'bg-yellow-800/90'
      }`}>
        {spot.type === 'restaurant' ? <MdRestaurant className="inline mr-1" /> : <MdLocalCafe className="inline mr-1" />}
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onFavoriteToggle(spot.id);
        }}
        color="light"
        size="xs"
        className="absolute top-3 right-3 !p-0 w-8 h-8 rounded-full !bg-white/90 backdrop-blur-sm hover:!bg-white transition-colors"
      >
        {isFavorite ? (
          <FaHeart className="text-red-500" />
        ) : (
          <FaRegHeart className="text-gray-600" />
        )}
      </Button>
    </div>
    
    <div className="p-4">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{spot.name}</h3>
        <div className="flex items-center gap-1 bg-[#6B8A62]/10 px-2 py-0.5 rounded-full">
          <FaStar className="text-yellow-400 text-xs" />
          <span className="text-sm font-medium text-gray-700">{spot.rating}</span>
          <span className="text-xs text-gray-500">({spot.reviewCount})</span>
        </div>
      </div>
      
      <p className="text-gray-500 text-sm mb-2">
        {spot.type === 'restaurant' ? spot.cuisine : spot.specialty}
      </p>
      
      <div className="flex items-center gap-2 text-gray-400 text-xs mb-3">
        <FaMapMarkerAlt className="text-[#6B8A62]" />
        <span className="text-gray-500">{spot.location}</span>
        <span className="text-gray-300">•</span>
        <span className="font-medium text-gray-600">{spot.priceRange}</span>
      </div>
      
      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{spot.description}</p>
      
      <Button
        onClick={() => onClick(spot)}
        className="w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-2.5 rounded-lg hover:shadow-lg hover:scale-102 transition-all duration-300 font-semibold flex items-center justify-center gap-2 cursor-pointer"
      >
        View Details
      </Button>
    </div>
  </Card>
);

interface SpotDetailModalProps {
  spot: Spot | null;
  onClose: () => void;
  isFavorite: boolean;
  onFavoriteToggle: (spotId: number) => void;
  onReserve: (spot: Spot) => void;
}

const SpotDetailModal: FC<SpotDetailModalProps> = ({ spot, onClose, isFavorite, onFavoriteToggle, onReserve }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  
  if (!spot) return null;
  
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container - 50% width on desktop, full on mobile */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-[90%] md:max-w-[50%] lg:max-w-[45%] xl:max-w-[40%] max-h-[90vh] overflow-y-auto">
        {/* Image Section with Loading State */}
        <div className="relative h-56 md:h-64 bg-gradient-to-br from-gray-100 to-gray-200">
          {!isImageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-3 border-[#6B8A62]/20 border-t-[#6B8A62] rounded-full animate-spin" />
            </div>
          )}
          <img
            src={spot.image}
            alt={spot.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
            onLoad={() => setIsImageLoaded(true)}
          />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 left-4 w-8 h-8 bg-black/50 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-all hover:scale-105"
            aria-label="Close modal"
          >
            <FaTimes className="text-sm" />
          </button>
          
          {/* Favorite Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavoriteToggle(spot.id);
            }}
            className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition-all duration-200"
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            {isFavorite ? (
              <FaHeart className="text-red-500 text-sm" />
            ) : (
              <FaRegHeart className="text-gray-600 text-sm" />
            )}
          </button>
        </div>
        
        {/* Content Section */}
        <div className="p-5 md:p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">
                {spot.name}
              </h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <div className="flex items-center gap-1 bg-[#6B8A62]/10 px-2 py-0.5 rounded-md">
                  <FaStar className="text-yellow-400 text-xs" />
                  <span className="text-sm font-semibold text-gray-800">{spot.rating}</span>
                  <span className="text-xs text-gray-500">({spot.reviewCount})</span>
                </div>
                <span className="text-gray-300">•</span>
                <span className="text-sm font-medium text-[#6B8A62]">{spot.priceRange}</span>
                <span className="text-gray-300">•</span>
                <span className="text-xs text-gray-500 capitalize">{spot.type}</span>
              </div>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed mb-5">
            {spot.description}
          </p>
          
          {/* Info Grid */}
          <div className="space-y-3 mb-5">
            {/* Location */}
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                <FaMapMarkerAlt className="text-[#6B8A62] text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 uppercase tracking-wide">Location</p>
                <p className="text-sm font-medium text-gray-800">{spot.location}</p>
                <p className="text-xs text-gray-500">{spot.address}</p>
              </div>
            </div>
            
            {/* Contact Row - Two items side by side */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaClock className="text-[#6B8A62] text-sm" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Hours</p>
                  <p className="text-sm text-gray-800">{spot.hours}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-[#6B8A62]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt className="text-[#6B8A62] text-sm" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
                  <p className="text-sm text-gray-800 truncate">{spot.phone}</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          {spot.features && spot.features.length > 0 && (
            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1">
                <span>✨</span> Amenities & Features
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {spot.features.map((feature, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 bg-gray-100 rounded-md text-xs text-gray-600 font-medium"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <ProtectedButton
              className="w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-2.5 rounded-lg hover:shadow-lg hover:scale-102 transition-all duration-300 font-semibold flex items-center justify-center gap-2 cursor-pointer"
              onClick={() => {
                onReserve(spot);
                onClose();
              }}
            >
              Make a Reservation
            </ProtectedButton>
            <Button
              color="light"
              className="px-5 border-2 border-gray-200 hover:border-[#6B8A62]/30 hover:bg-[#6B8A62]/10 transition-all duration-200 font-medium flex items-center gap-2"
              onClick={() => alert(`Directions to ${spot.name}`)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Directions
            </Button>
          </div>
          
          {/* Quick Tip */}
          <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100">
            <p className="text-xs text-amber-700 flex items-center gap-1.5">
              <span className="text-base">💡</span>
              Popular times: {spot.type === 'restaurant' ? '7-8 PM' : '10-11 AM'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main component
export default function Spots() {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<'all' | 'restaurant' | 'cafe'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpot, setSelectedSpot] = useState<Spot | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [priceFilter, setPriceFilter] = useState<'all' | '$' | '$$' | '$$$'>('all');
  const [ratingFilter, setRatingFilter] = useState<number>(0);

  // Filter spots based on all criteria
  const filteredSpots = useMemo(() => {
    let spots = mockSpots;
    
    // Type filter
    if (filterType !== 'all') {
      spots = spots.filter(spot => spot.type === filterType);
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      spots = spots.filter(spot =>
        spot.name.toLowerCase().includes(term) ||
        (spot.cuisine && spot.cuisine.toLowerCase().includes(term)) ||
        (spot.specialty && spot.specialty.toLowerCase().includes(term)) ||
        spot.location.toLowerCase().includes(term) ||
        spot.description.toLowerCase().includes(term)
      );
    }
    
    // Price filter
    if (priceFilter !== 'all') {
      spots = spots.filter(spot => spot.priceRange === priceFilter);
    }
    
    // Rating filter
    if (ratingFilter > 0) {
      spots = spots.filter(spot => spot.rating >= ratingFilter);
    }
    
    return spots;
  }, [filterType, searchTerm, priceFilter, ratingFilter]);

  const restaurantCount = mockSpots.filter(spot => spot.type === 'restaurant').length;
  const cafeCount = mockSpots.filter(spot => spot.type === 'cafe').length;
  
  const handleReserveFromSpot = useCallback(
    (spot: Spot) => {
      navigate('/reservation', { state: { restaurant: spotToReservationRestaurant(spot) } });
    },
    [navigate]
  );

  const handleFavoriteToggle = useCallback((spotId: number) => {
    setFavorites(prev => 
      prev.includes(spotId) 
        ? prev.filter(id => id !== spotId)
        : [...prev, spotId]
    );
  }, []);
  
  const clearAllFilters = () => {
    setFilterType('all');
    setSearchTerm('');
    setPriceFilter('all');
    setRatingFilter(0);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    filterType !== 'all' ||
    priceFilter !== 'all' ||
    ratingFilter > 0;

  const filterButtonClass = (active: boolean) =>
    `w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? 'bg-[#6B8A62] text-white shadow-sm'
        : 'bg-gray-50 text-gray-700 hover:bg-[#6B8A62]/10 hover:text-[#6B8A62]'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
          Discover <span className="text-[#6B8A62]">Trending</span> Tables
        </h1>
        <p className="text-gray-500 text-base sm:text-lg max-w-3xl mx-auto">
          Find the best restaurants and cafes in your area. Filter by type, price, and rating.
        </p>
      </div>


        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Left sidebar — filters */}
          <aside className="lg:w-72 xl:w-80 shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <Card className="shadow-md border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-[#6B8A62]/5">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <FaSearch className="text-[#6B8A62]" />
                    Filters
                  </h2>
                </div>

                <div className="p-4 space-y-6">
                  <div>
                    <label htmlFor="spots-search" className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Search
                    </label>
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6B8A62] text-sm" />
                      <TextInput
                        id="spots-search"
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Name, cuisine, location..."
                        className="pl-9 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Spot type</p>
                    <div className="space-y-1.5">
                      <button type="button" onClick={() => setFilterType('all')} className={filterButtonClass(filterType === 'all')}>
                        <span className="flex items-center gap-2">
                          <FaInfoCircle className="text-sm" />
                          All spots
                        </span>
                        <Badge color={filterType === 'all' ? 'gray' : 'gray'} className={filterType === 'all' ? 'bg-white/20 text-white' : ''}>
                          {mockSpots.length}
                        </Badge>
                      </button>
                      <button type="button" onClick={() => setFilterType('restaurant')} className={filterButtonClass(filterType === 'restaurant')}>
                        <span className="flex items-center gap-2">
                          <MdRestaurant className="text-sm" />
                          Restaurants
                        </span>
                        <span className="text-xs opacity-80">{restaurantCount}</span>
                      </button>
                      <button type="button" onClick={() => setFilterType('cafe')} className={filterButtonClass(filterType === 'cafe')}>
                        <span className="flex items-center gap-2">
                          <MdLocalCafe className="text-sm" />
                          Cafes
                        </span>
                        <span className="text-xs opacity-80">{cafeCount}</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Price range</p>
                    <div className="grid grid-cols-4 gap-1.5">
                      {(['all', '$', '$$', '$$$'] as const).map((price) => (
                        <button
                          key={price}
                          type="button"
                          onClick={() => setPriceFilter(price)}
                          className={`py-2 rounded-lg text-sm font-medium transition-all ${
                            priceFilter === price
                              ? 'bg-[#6B8A62] text-white'
                              : 'bg-gray-50 text-gray-600 hover:bg-[#6B8A62]/10'
                          }`}
                        >
                          {price === 'all' ? 'Any' : price}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Minimum rating</p>
                    <div className="space-y-1.5">
                      {[
                        { value: 0, label: 'Any rating' },
                        { value: 4, label: '4+ stars' },
                        { value: 4.5, label: '4.5+ stars' },
                        { value: 4.8, label: '4.8+ stars' },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setRatingFilter(value)}
                          className={filterButtonClass(ratingFilter === value)}
                        >
                          <span className="flex items-center gap-2">
                            {value > 0 && <FaStar className="text-yellow-400 text-xs" />}
                            {label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {hasActiveFilters && (
                    <Button
                      color="light"
                      onClick={clearAllFilters}
                      className="w-full border border-gray-200 text-gray-600 hover:border-[#6B8A62]/30"
                    >
                      Clear all filters
                    </Button>
                  )}
                </div>
              </Card>
            </div>
          </aside>

          {/* Main content — results */}
          <main className="flex-1 min-w-0">
            <div className="flex flex-wrap justify-end items-center gap-3 mb-6">
              <p className="text-gray-500 text-sm">
                Showing <span className="font-semibold text-gray-800">{filteredSpots.length}</span> of{' '}
                <span className="font-semibold text-gray-800">{mockSpots.length}</span> spots
              </p>
              {/* {favorites.length > 0 && (
                <p className="text-sm text-[#6B8A62] font-medium">
                  {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
                </p>
              )} */}
            </div>

            {(searchTerm || priceFilter !== 'all' || ratingFilter > 0 || filterType !== 'all') && (
              <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                <span className="text-xs text-gray-500 font-medium">Active:</span>
                {filterType !== 'all' && (
                  <Badge color="success" size="sm" className="bg-[#6B8A62] capitalize">
                    {filterType}
                  </Badge>
                )}
                {searchTerm && (
                  <Badge color="success" size="sm" className="flex items-center gap-1 bg-[#6B8A62]">
                    &quot;{searchTerm}&quot;
                    <button type="button" onClick={() => setSearchTerm('')} aria-label="Clear search">
                      <FaTimes className="text-xs" />
                    </button>
                  </Badge>
                )}
                {priceFilter !== 'all' && (
                  <Badge color="success" size="sm" className="bg-[#6B8A62]">
                    {priceFilter}
                  </Badge>
                )}
                {ratingFilter > 0 && (
                  <Badge color="success" size="sm" className="bg-[#6B8A62]">
                    {ratingFilter}+ ★
                  </Badge>
                )}
              </div>
            )}

            {filteredSpots.length === 0 ? (
              <Card className="text-center py-16 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaSearch className="text-2xl text-gray-400" />
                </div>
                <p className="text-gray-600 text-lg font-medium mb-1">No spots found</p>
                <p className="text-gray-400 text-sm mb-6">Try adjusting your filters</p>
                <Button onClick={clearAllFilters} className="mx-auto bg-[#6B8A62] hover:bg-[#5A7352]">
                  Clear all filters
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSpots.map((spot) => (
                  <SpotCard
                    key={spot.id}
                    spot={spot}
                    onClick={setSelectedSpot}
                    isFavorite={favorites.includes(spot.id)}
                    onFavoriteToggle={handleFavoriteToggle}
                  />
                ))}
              </div>
            )}

            <p className="mt-10 text-center text-xs text-gray-400">
              Ratings and reviews are based on user feedback · Prices are estimates
            </p>
          </main>
        </div>

        {selectedSpot && (
          <SpotDetailModal
            spot={selectedSpot}
            onClose={() => setSelectedSpot(null)}
            isFavorite={favorites.includes(selectedSpot.id)}
            onFavoriteToggle={handleFavoriteToggle}
            onReserve={handleReserveFromSpot}
          />
        )}
      </div>
    </div>
  );
}