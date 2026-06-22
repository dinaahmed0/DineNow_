import { apiGet, apiPost } from './api/client';
import { API } from '../constants/api';
import { buildQueryString } from '../lib/api-helpers';
import type { ApiResponse } from '../types/common';
import type { PaginationData } from '../types/reservation';

export interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
}

export type ReviewResponse = ApiResponse<Review>;
export type ReviewsListResponse = ApiResponse<PaginationData<Review>>;

export const reviewService = {
  addReview(
    restaurantId: number,
    rating: number,
    comment: string
  ): Promise<ReviewResponse> {
    return apiPost<ReviewResponse>(API.restaurant.addReview, {
      restaurantId,
      rating,
      comment,
    });
  },

  getReviews(filters?: {
    pageIndex?: number;
    pageSize?: number;
    restaurantId?: number;
  }): Promise<ReviewsListResponse> {
    const qs = buildQueryString({
      // Unlike every other paginated endpoint in this API, get-reviews is 1-based —
      // PageIndex=0 makes the backend compute a negative SQL OFFSET and 500.
      PageIndex: (filters?.pageIndex ?? 0) + 1,
      PageSize: filters?.pageSize,
      RestaurantId: filters?.restaurantId,
    });
    return apiGet<ReviewsListResponse>(`${API.restaurant.getReviews}${qs}`);
  },
};
