import React, { useState, useEffect } from 'react';
import './ReviewsList.css';
import { reviewService } from '../../services/reviewService';
import type { Review } from '../../services/reviewService';

interface ReviewsListProps {
  pageSize?: number;
}

export const ReviewsList: React.FC<ReviewsListProps> = ({ pageSize = 10 }) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [pageIndex, setPageIndex] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchReviews();
  }, [pageIndex, pageSize]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await reviewService.getReviews({
        pageIndex: pageIndex - 1,
        pageSize,
      });

      if (response.succeeded) {
        setReviews(response.data.data);
        setTotalCount(response.data.count);
      } else {
        setError(response.message || 'Failed to load reviews');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="stars">
        {[1, 2, 3, 4, 5].map((num) => (
          <span key={num} className={`star ${rating >= num ? 'active' : 'inactive'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading && reviews.length === 0) {
    return <div className="reviews-loading">Loading reviews...</div>;
  }

  return (
    <div className="reviews-list-container">
      <h2>My Reviews</h2>

      {error && <div className="error-message">{error}</div>}

      {reviews.length === 0 && !error ? (
        <p className="no-reviews">You haven't written any reviews yet.</p>
      ) : (
        <>
          <div className="reviews-grid">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <div className="review-meta">
                    <span className="user-name">{review.userName}</span>
                  </div>
                  {renderStars(review.rating)}
                </div>
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>

          {totalCount > pageSize && (
            <div className="pagination">
              <button
                onClick={() => setPageIndex(Math.max(1, pageIndex - 1))}
                disabled={pageIndex === 1}
              >
                Previous
              </button>
              <span>
                Page {pageIndex} of {Math.ceil(totalCount / pageSize)}
              </span>
              <button
                onClick={() => setPageIndex(pageIndex + 1)}
                disabled={pageIndex >= Math.ceil(totalCount / pageSize)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};