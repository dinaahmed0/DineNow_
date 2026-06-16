import { useState, useMemo } from 'react';
import { FaQuoteLeft, FaChevronLeft, FaChevronRight, FaUser, FaMapMarkerAlt, FaCalendarAlt,FaShare,FaHeart} from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../constants/routes';


interface Review {
  id: number;
  userName: string;
  userAvatar?: string;
  rating: number;
  date: string;
  restaurantName: string;
  restaurantImage: string;
  location: string;
  reviewText: string;
  helpful: number;
  verified: boolean;
}

const mockReviews: Review[] = [
  {
    id: 1,
    userName: "Sarah Johnson",
    rating: 5,
    date: "2024-04-20",
    restaurantName: "L'Ulivo - Italian Restaurant",
    restaurantImage: "https://images.unsplash.com/photo-1555396273-357c3479d8f8?w=400&h=300&fit=crop",
    location: "Cairo, Egypt",
    reviewText: "Absolutely phenomenal dining experience! The pasta was freshly made and the ambiance was perfect for our anniversary dinner. The staff went above and beyond to make our special night memorable. Will definitely be returning!",
    helpful: 24,
    verified: true
  },
  {
    id: 2,
    userName: "Michael Chen",
    rating: 4,
    date: "2024-04-18",
    restaurantName: "Sakura Sushi Bar",
    restaurantImage: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop",
    location: "Cairo, Egypt",
    reviewText: "Great sushi selection and very fresh ingredients. The omakase was impressive though a bit pricey. The chef's recommendations were spot on. Perfect place for a special occasion.",
    helpful: 18,
    verified: true
  },
  {
    id: 3,
    userName: "Emily Rodriguez",
    rating: 5,
    date: "2024-04-15",
    restaurantName: "The Steakhouse",
    restaurantImage: "https://images.unsplash.com/photo-1559315349-fbc5cfa96d61?w=400&h=300&fit=crop",
    location: "Cairo, Egypt",
    reviewText: "Best steak I've had in Cairo! Cooked to perfection and the sides were delicious. The wine pairing was excellent. Service was attentive but not intrusive. Highly recommend for steak lovers!",
    helpful: 31,
    verified: true
  },
  {
    id: 4,
    userName: "David Kim",
    rating: 4,
    date: "2024-04-12",
    restaurantName: "Mediterranean Breeze",
    restaurantImage: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop",
    location: "Cairo, Egypt",
    reviewText: "Lovely atmosphere and authentic Mediterranean flavors. The hummus was incredible and the grilled seafood was fresh. Great for a casual dinner with friends. Outdoor seating is beautiful in the evening.",
    helpful: 15,
    verified: true
  },
  {
    id: 5,
    userName: "Amanda Foster",
    rating: 5,
    date: "2024-04-10",
    restaurantName: "Le Petit Café",
    restaurantImage: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400&h=300&fit=crop",
    location: "Cairo, Egypt",
    reviewText: "Charming French café with amazing pastries and coffee! Perfect for brunch. The croissants are buttery and delicious. Cozy atmosphere and friendly staff. My new favorite spot in the city!",
    helpful: 22,
    verified: true
  },
  {
    id: 6,
    userName: "James Wilson",
    rating: 4,
    date: "2024-04-08",
    restaurantName: "Spice Garden",
    restaurantImage: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop",
    location: "Cairo, Egypt",
    reviewText: "Excellent Indian cuisine with authentic flavors. The butter chicken was rich and creamy, and the naan bread was perfectly cooked. Good portion sizes and reasonable prices. Will be back to try more dishes!",
    helpful: 19,
    verified: true
  }
];

export default function UserReviewsSpotlight() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const filter: 'all' | '5star' | '4star' = 'all';
  const [likedReviews, setLikedReviews] = useState<Set<number>>(new Set());
  const [isAnimating, setIsAnimating] = useState(false);

  // Enhanced filtering and sorting with useMemo for performance
  const processedReviews = useMemo(() => {
    const filtered = mockReviews.filter(review => {
      const matchesFilter = filter === 'all' || 
        (filter === '5star' && review.rating === 5) ||
        (filter === '4star' && review.rating === 4);

      return matchesFilter;
    });

    // Sort by newest for spotlight cards.
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return filtered;
  }, [filter]);

  const visibleReviews = processedReviews.slice(currentIndex, currentIndex + 3);

  const nextSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentIndex < processedReviews.length - 3) {
        setCurrentIndex(currentIndex + 3);
      } else {
        setCurrentIndex(0);
      }
      setIsAnimating(false);
    }, 300);
  };

  const prevSlide = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 3);
      } else {
        setCurrentIndex(Math.max(0, processedReviews.length - 3));
      }
      setIsAnimating(false);
    }, 300);
  };

  const handleLikeReview = (reviewId: number) => {
    setLikedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const handleShareReview = (review: Review) => {
    if (navigator.share) {
      navigator.share({
        title: `Review of ${review.restaurantName}`,
        text: `${review.userName} rated ${review.restaurantName} ${review.rating} stars: ${review.reviewText.substring(0, 100)}...`,
        url: window.location.href
      });
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(
        `Check out this review of ${review.restaurantName}: ${review.reviewText.substring(0, 100)}...`
      );
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-3">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            What Our <span className="text-[#6B8A62]">Customers</span> Say
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            Discover why thousands of food lovers trust DineNow for their restaurant reservations.
          </p>
          
          
        </div>

        {/* Reviews Carousel */}
        <div className={`relative transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
            {visibleReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl shadow-md shadow-[#6B8A62]/10 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:scale-105"
              >
                {/* Review Content */}
                <div className="px-4 py-2">
                  {/* Reviewer Info */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <FaUser className="text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{review.userName}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <FaCalendarAlt className="text-xs" />
                        <span>{getRelativeTime(review.date)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <div className="relative mb-2">
                    <FaQuoteLeft className="text-[#6B8A62]/20 text-2xl absolute -top-2 -left-2" />
                    <p className="text-gray-700 leading-relaxed pl-6">
                      {review.reviewText}
                    </p>
                  </div>

                  {/* Share and Read More - Above the bottom section */}
                  <div className="flex justify-end gap-2 mb-4">
                    <button 
                      onClick={() => handleShareReview(review)}
                      className="text-sm text-[#6B8A62] hover:text-[#5A7352] font-medium"
                    >
                      <FaShare className="inline mr-1" />
                      Share
                    </button>
                  </div>

                  {/* Bottom Section - Restaurant Info and Favorite */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    {/* Restaurant Name and Location - Bottom Left */}
                    <div>
                      <h3 className="font-semibold text-gray-900 text-lg">
                        {review.restaurantName}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                        <FaMapMarkerAlt className="text-[#6B8A62]" />
                        <span>{review.location}</span>
                      </div>
                    </div>

                    {/* Favorite Button - Bottom Right */}
                    <button 
                      onClick={() => handleLikeReview(review.id)}
                      className={`flex items-center gap-1 text-sm transition ${
                        likedReviews.has(review.id) 
                          ? 'text-red-600 hover:text-red-700' 
                          : 'text-gray-600 hover:text-[#6B8A62]'
                      }`}
                    >
                      <FaHeart className={likedReviews.has(review.id) ? 'text-red-600' : ''} />
                      Helpful ({review.helpful + (likedReviews.has(review.id) ? 1 : 0)})
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Buttons */}
          {processedReviews.length > 3 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute -left-15 top-1/2 -translate-y-1/2 bg-[#6B8A62]/10 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentIndex === 0}
              >
                <FaChevronLeft className="text-[#6B8A62]" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute -right-15 top-1/2 -translate-y-1/2 bg-[#6B8A62]/10 rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentIndex >= processedReviews.length - 3}
              >
                <FaChevronRight className="text-[#6B8A62]" />
              </button>
            </>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Had a great experience at one of our restaurants?
          </p>
          <Link to={`${APP_ROUTES.myReservations}?tab=past`}>
          <button className="bg-gradient-to-r from-[#6B8A62] to-[#5A7352] hover:shadow-lg hover:scale-105 transition-all duration-300 text-white px-8 py-3 rounded-lg font-bold">
            Share Your Feedback →
          </button>
          </Link>
        </div>
      </div>
    </section>
  );
}