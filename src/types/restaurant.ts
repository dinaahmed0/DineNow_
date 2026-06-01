import type { ApiResponse } from './common';
import type { PaginationData } from './reservation';

/** Shape returned by GET /api/Restaurant and GET /api/Restaurant/{id} */
export interface RestaurantApiDto {
  id: number;
  name: string;
  isActive: boolean;
  averageRating: number;
}

export interface CreateRestaurantApiCommand {
  ownerEmail: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  openingHours: string;
}

export interface UpdateRestaurantApiCommand {
  restaurantId: number;
  address: string;
  phone: string;
  isActive: boolean;
  openingHours: string;
}

export type RestaurantApiResponse = ApiResponse<RestaurantApiDto>;
export type RestaurantListApiResponse = ApiResponse<PaginationData<RestaurantApiDto>>;

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  hours: string;
  features: string[];
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AddRestaurantCommand {
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  priceRange: string;
  location: string;
  hours: string;
  features: string[];
  image?: string;
}

export interface UpdateRestaurantCommand {
  id: number;
  name?: string;
  description?: string;
  cuisine?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  priceRange?: string;
  location?: string;
  hours?: string;
  features?: string[];
  image?: string;
  isActive?: boolean;
}

export interface ReturnRestaurantQuery {
  id: number;
  name: string;
  description: string;
  cuisine: string;
  address: string;
  phone: string;
  email?: string;
  website?: string;
  rating: number;
  reviewCount: number;
  priceRange: string;
  location: string;
  hours: string;
  features: string[];
  image?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnRestaurantQueryPagination {
  restaurants: ReturnRestaurantQuery[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
}

export interface AddReviewCommand {
  restaurantId: number;
  rating: number;
  comment: string;
  userId?: number;
}

export interface GetReviewQuery {
  id: number;
  restaurantId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface GetReviewQueryPagination {
  reviews: GetReviewQuery[];
  totalCount: number;
  currentPage: number;
  pageSize: number;
  totalPages: number;
  averageRating: number;
}
