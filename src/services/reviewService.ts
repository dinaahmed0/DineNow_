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
      PageIndex: filters?.pageIndex,
      PageSize: filters?.pageSize,
      RestaurantId: filters?.restaurantId,
    });
    return apiGet<ReviewsListResponse>(`${API.restaurant.getReviews}${qs}`);
  },
};
