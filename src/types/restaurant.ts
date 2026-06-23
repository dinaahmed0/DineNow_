import type { ApiResponse } from './common';
import type { PaginationData } from './reservation';

/**
 * Shape returned by GET /api/Restaurant and GET /api/Restaurant/{id}.
 * The backend's ReturnRestaurantQuery only ever includes id/name/isActive/averageRating/imageUrl -
 * address/phone/openingHours are not returned and should not be relied on for pre-filling forms.
 */
export interface RestaurantApiDto {
  id: number;
  name: string;
  isActive: boolean;
  averageRating: number;
  imageUrl?: string | null;
  address?: string;
  phone?: string;
  openingHours?: string;
}

export interface CreateRestaurantApiCommand {
  ownerEmail: string;
  name: string;
  address: string;
  phone: string;
  isActive: boolean;
  openingHours: string;
}

/**
 * Backend `UpdateRestaurantCommand`: only restaurantId is required.
 * address/phone/openingHours are optional/nullable - omit a field to leave it unchanged.
 */
export interface UpdateRestaurantApiCommand {
  restaurantId: number;
  address?: string;
  phone?: string;
  isActive?: boolean;
  openingHours?: string;
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

