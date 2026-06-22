import type { ApiResponse } from './common';

/** Shape returned by GET /api/Favorite */
export interface FavoriteRestaurant {
  restaurantId: number;
  restaurantName: string;
  imageUrl?: string | null;
  averageRating: number;
  address?: string | null;
}

export type FavoriteListResponse = ApiResponse<FavoriteRestaurant[]>;
