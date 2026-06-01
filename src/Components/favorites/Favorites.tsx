import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';
import {
  FaHeart,
  FaRegHeart,
  FaStar,
  FaMapMarkerAlt,
  FaChevronLeft,
  FaUtensils,
} from 'react-icons/fa';
import { MdRestaurant, MdLocalCafe } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';

const INITIAL_FAVORITES = [
  {
    id: 1,
    name: 'Cozy Cafe',
    rating: 4.5,
    reviewCount: 120,
    cuisine: 'Cafe',
    type: 'cafe' as const,
    location: 'Downtown',
    priceRange: '$$',
    description: 'A warm and inviting spot for coffee lovers.',
    image: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&h=400&fit=crop',
  },
  {
    id: 2,
    name: 'Urban Bistro',
    rating: 4.8,
    reviewCount: 200,
    cuisine: 'Italian',
    type: 'restaurant' as const,
    location: 'City Center',
    priceRange: '$$$',
    description: 'Modern Italian dining with a cozy atmosphere.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop',
  },
  {
    id: 3,
    name: 'Green Leaf Cafe',
    rating: 4.4,
    reviewCount: 312,
    cuisine: 'Healthy',
    type: 'cafe' as const,
    location: 'East Side',
    priceRange: '$$',
    description: 'Organic coffee and healthy breakfast options.',
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&h=400&fit=crop',
  },
];

type FavoriteSpot = (typeof INITIAL_FAVORITES)[number];

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteSpot[]>(INITIAL_FAVORITES);
  const [filterType, setFilterType] = useState<'all' | 'restaurant' | 'cafe'>('all');

  const filteredFavorites =
    filterType === 'all' ? favorites : favorites.filter((f) => f.type === filterType);

  const removeFavorite = (id: number) => {
    setFavorites((prev) => prev.filter((f) => f.id !== id));
  };

  const restaurantCount = favorites.filter((f) => f.type === 'restaurant').length;
  const cafeCount = favorites.filter((f) => f.type === 'cafe').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-[#6B8A62]/10 pt-20 flex items-center justify-center px-4">
        <Card className="max-w-md w-full text-center shadow-lg border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaHeart className="text-2xl text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Sign in to see favorites</h2>
          <p className="text-gray-500 mb-6 text-sm">Save your favorite restaurants and cafes for quick access.</p>
          <Button onClick={() => navigate(APP_ROUTES.login)} className="w-full bg-[#6B8A62] hover:bg-[#5A7352]">
            Go to Login
          </Button>
        </Card>
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

        {/* Header */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg mb-8 bg-gradient-to-r from-[#6B8A62] to-[#5A7352]">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute -right-8 -top-8 w-40 h-40 bg-white rounded-full" />
            <div className="absolute -left-4 bottom-0 w-32 h-32 bg-white rounded-full" />
          </div>
          <div className="relative px-6 py-8 sm:px-10 sm:py-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-white text-xs font-medium mb-3">
                <FaHeart className="text-red-200" />
                Saved spots
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">My Favorites</h1>
              <p className="text-white/80 text-sm sm:text-base max-w-lg">
                Your hand-picked restaurants and cafes — book again in one tap.
              </p>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center min-w-[72px]">
                <p className="text-2xl font-bold text-white">{favorites.length}</p>
                <p className="text-xs text-white/70 uppercase tracking-wide">Total</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center min-w-[72px]">
                <p className="text-2xl font-bold text-white">{restaurantCount}</p>
                <p className="text-xs text-white/70 uppercase tracking-wide">Dining</p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm rounded-xl px-5 py-3 text-center min-w-[72px]">
                <p className="text-2xl font-bold text-white">{cafeCount}</p>
                <p className="text-xs text-white/70 uppercase tracking-wide">Cafés</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        {favorites.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {(
              [
                { key: 'all' as const, label: 'All', count: favorites.length },
                { key: 'restaurant' as const, label: 'Restaurants', count: restaurantCount },
                { key: 'cafe' as const, label: 'Cafés', count: cafeCount },
              ] as const
            ).map(({ key, label, count }) => (
              <button
                key={key}
                type="button"
                onClick={() => setFilterType(key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  filterType === key
                    ? 'bg-[#6B8A62] text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-[#6B8A62]/40'
                }`}
              >
                {label}
                <span className={`ml-1.5 ${filterType === key ? 'text-white/80' : 'text-gray-400'}`}>
                  ({count})
                </span>
              </button>
            ))}
          </div>
        )}

        {filteredFavorites.length === 0 ? (
          <Card className="text-center py-16 shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRegHeart className="text-3xl text-red-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {favorites.length === 0 ? 'No favorites yet' : 'No matches for this filter'}
            </h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              {favorites.length === 0
                ? 'Explore spots and tap the heart icon to save places you love.'
                : 'Try another category or add more favorites from Spots.'}
            </p>
            <Link
              to={APP_ROUTES.spots}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#6B8A62] text-white rounded-xl hover:bg-[#5A7352] font-medium transition-colors"
            >
              <FaUtensils />
              Discover Spots
            </Link>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((fav) => (
              <Card
                key={fav.id}
                className="group overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={fav.image}
                    alt={fav.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div
                    className={`absolute top-3 left-3 px-3 py-1 rounded-full text-white text-xs font-medium backdrop-blur-sm capitalize ${
                      fav.type === 'restaurant' ? 'bg-red-700/90' : 'bg-amber-800/90'
                    }`}
                  >
                    {fav.type === 'restaurant' ? (
                      <MdRestaurant className="inline mr-1" />
                    ) : (
                      <MdLocalCafe className="inline mr-1" />
                    )}
                    {fav.type}
                  </div>
                  <Button
                    onClick={() => removeFavorite(fav.id)}
                    color="light"
                    size="xs"
                    className="absolute top-3 right-3 !p-0 w-9 h-9 rounded-full !bg-white/95 backdrop-blur-sm hover:!bg-white shadow-sm"
                    aria-label={`Remove ${fav.name} from favorites`}
                  >
                    <FaHeart className="text-red-500" />
                  </Button>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{fav.name}</h3>
                    <div className="flex items-center gap-1 bg-[#6B8A62]/10 px-2 py-0.5 rounded-full shrink-0">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-sm font-medium text-gray-700">{fav.rating}</span>
                    </div>
                  </div>

                  <p className="text-[#6B8A62] text-sm font-medium mb-2">{fav.cuisine}</p>

                  <div className="flex items-center gap-2 text-xs mb-3">
                    <FaMapMarkerAlt className="text-[#6B8A62] shrink-0" />
                    <span className="text-gray-500">{fav.location}</span>
                    <span className="text-gray-300">•</span>
                    <span className="font-medium text-gray-600">{fav.priceRange}</span>
                  </div>

                  <p className="text-gray-600 text-sm line-clamp-2 mb-4">{fav.description}</p>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => navigate(APP_ROUTES.spots)}
                      className="flex-1 bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-2.5 rounded-lg font-semibold"
                    >
                      View Spot
                    </Button>
                    <Button
                      color="light"
                      onClick={() => navigate('/reservation')}
                      className="px-3 border border-[#6B8A62]/30 text-[#6B8A62] hover:bg-[#6B8A62]/5"
                    >
                      Book
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {favorites.length > 0 && (
          <p className="mt-10 text-center text-xs text-gray-400">
            Tip: visit <Link to={APP_ROUTES.spots} className="text-[#6B8A62] hover:underline">Spots</Link> to discover more places
          </p>
        )}
      </div>
    </div>
  );
}
