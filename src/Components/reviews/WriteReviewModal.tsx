import React, { useState } from 'react';
import './WriteReviewModal.css';
import { reviewService } from '../../services/reviewService';

interface WriteReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  restaurantId: number;
  restaurantName: string;
  onReviewSubmitted: () => void;
}

export const WriteReviewModal: React.FC<WriteReviewModalProps> = ({
  isOpen,
  onClose,
  restaurantId,
  restaurantName,
  onReviewSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!comment.trim()) {
      setError('Please write a comment');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await reviewService.addReview(restaurantId, rating, comment);
      
      if (response.succeeded) {
        setRating(5);
        setComment('');
        onReviewSubmitted();
        onClose();
      } else {
        setError(response.message || 'Failed to submit review');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Write a Review</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>

        <div className="modal-body">
          <p className="restaurant-name">
            Reviewing: <strong>{restaurantName}</strong>
          </p>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Rating</label>
              <div className="rating-input">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`star ${rating >= num ? 'active' : ''}`}
                    onClick={() => setRating(num)}
                    aria-label={`Rate ${num} stars`}
                  >
                    ★
                  </button>
                ))}
                <span className="rating-value">{rating}/5</span>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="comment">Your Review</label>
              <textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your experience at this restaurant..."
                rows={5}
                disabled={isLoading}
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <div className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose} disabled={isLoading}>
                Cancel
              </button>
              <button type="submit" className="btn-submit" disabled={isLoading}>
                {isLoading ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};