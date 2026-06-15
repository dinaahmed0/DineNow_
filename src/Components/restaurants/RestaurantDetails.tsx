import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaPhone, FaClock, FaMapMarkerAlt } from 'react-icons/fa';
import { getRestaurantById } from '../../services/restaurant';
import { ReviewsList } from '../reviews/ReviewList';
import type { ReturnRestaurantQuery } from '../../types/restaurant';
import { APP_ROUTES } from '../../constants/routes';

export default function RestaurantDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState<ReturnRestaurantQuery | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    getRestaurantById(Number(id))
      .then(r => setRestaurant(r))
      .catch(e => setError(e instanceof Error ? e.message : 'Failed to load restaurant'))
      .finally(() => setIsLoading(false));
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#6B8A62] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error ?? 'Restaurant not found'}</p>
          <button
            type="button"
            onClick={() => navigate(APP_ROUTES.spots)}
            className="px-4 py-2 bg-[#6B8A62] text-white rounded-xl hover:bg-[#5A7352]"
          >
            Back to Spots
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#6B8A62] hover:text-[#5A7352] font-medium mb-6"
        >
          <FaChevronLeft className="text-sm" />
          Back
        </button>

        {restaurant.image && (
          <img
            src={restaurant.image}
            alt={restaurant.name}
            className="w-full h-64 object-cover rounded-2xl mb-6"
          />
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{restaurant.name}</h1>
          {restaurant.description && (
            <p className="text-gray-600 mb-4">{restaurant.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {restaurant.phone && (
              <span className="flex items-center gap-1.5">
                <FaPhone className="text-[#6B8A62]" />
                {restaurant.phone}
              </span>
            )}
            {restaurant.hours && (
              <span className="flex items-center gap-1.5">
                <FaClock className="text-[#6B8A62]" />
                {restaurant.hours}
              </span>
            )}
            {restaurant.address && (
              <span className="flex items-center gap-1.5">
                <FaMapMarkerAlt className="text-[#6B8A62]" />
                {restaurant.address}
              </span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Reviews</h2>
          <ReviewsList restaurantId={Number(id)} pageSize={10} />
        </div>
      </div>
    </div>
  );
}
