import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Button } from 'flowbite-react';
import { FaHeart, FaRegHeart, FaStar, FaMapMarkerAlt, FaChevronLeft, FaUtensils, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { APP_ROUTES } from '../../constants/routes';
import { getFavorites, removeFavorite } from '../../services/favorite';
import type { FavoriteRestaurant } from '../../types/favorite';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&h=400&fit=crop';

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function fetchFavorites() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getFavorites();
        if (!cancelled) {
          setFavorites(response.data ?? []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load favorites');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    void fetchFavorites();
    return () => { cancelled = true; };
  }, [user]);

  const handleRemove = async (restaurantId: number) => {
    setRemovingId(restaurantId);
    try {
      await removeFavorite(restaurantId);
      setFavorites((prev) => prev.filter((f) => f.restaurantId !== restaurantId));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to remove favorite');
    } finally {
      setRemovingId(null);
    }
  };

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
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FaSpinner className="animate-spin text-3xl text-[#6B8A62] mb-3" />
            <p className="text-gray-500 text-sm">Loading your favorites...</p>
          </div>
        ) : error ? (
          <Card className="text-center py-16 shadow-sm">
            <p className="text-red-600 text-lg font-medium mb-1">Failed to load favorites</p>
            <p className="text-gray-400 text-sm mb-6">{error}</p>
            <Button onClick={() => window.location.reload()} className="mx-auto bg-[#6B8A62] hover:bg-[#5A7352]">
              Try again
            </Button>
          </Card>
        ) : favorites.length === 0 ? (
          <Card className="text-center py-16 shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaRegHeart className="text-3xl text-red-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No favorites yet</h3>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              Explore spots and tap the heart icon to save places you love.
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
            {favorites.map((fav) => (
              <Card
                key={fav.restaurantId}
                className="group overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={fav.imageUrl || DEFAULT_IMAGE}
                    alt={fav.restaurantName}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_IMAGE; }}
                  />
                  <Button
                    onClick={() => handleRemove(fav.restaurantId)}
                    disabled={removingId === fav.restaurantId}
                    color="light"
                    size="xs"
                    className="absolute top-3 right-3 !p-0 w-9 h-9 rounded-full !bg-white/95 backdrop-blur-sm hover:!bg-white shadow-sm disabled:opacity-50"
                    aria-label={`Remove ${fav.restaurantName} from favorites`}
                  >
                    <FaHeart className="text-red-500" />
                  </Button>
                </div>

                <div className="p-4">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{fav.restaurantName}</h3>
                    <div className="flex items-center gap-1 bg-[#6B8A62]/10 px-2 py-0.5 rounded-full shrink-0">
                      <FaStar className="text-yellow-400 text-xs" />
                      <span className="text-sm font-medium text-gray-700">{fav.averageRating.toFixed(1)}</span>
                    </div>
                  </div>

                  {fav.address && (
                    <div className="flex items-center gap-2 text-xs mb-4">
                      <FaMapMarkerAlt className="text-[#6B8A62] shrink-0" />
                      <span className="text-gray-500 line-clamp-1">{fav.address}</span>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Link to={`/restaurant/${fav.restaurantId}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-[#6B8A62] to-[#5A7352] text-white py-2.5 rounded-lg font-semibold">
                        View Spot
                      </Button>
                    </Link>
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
