import { apiGet, apiDelete } from './api/client';
import { API } from '../constants/api';
import { buildQueryString, unwrapApiResponse } from '../lib/api-helpers';
import { reviewService } from './reviewService';
import type {
  AddReviewCommand,
  RestaurantApiDto,
  RestaurantListApiResponse,
  RestaurantApiResponse,
  ReturnRestaurantQuery,
  ReturnRestaurantQueryPagination,
} from '../types/restaurant';
import type { ApiResponse } from '../types/common';
import type { PaginationData } from '../types/reservation';

function mapRestaurantDtoToView(
  dto: RestaurantApiDto,
  extras: Partial<ReturnRestaurantQuery> = {}
): ReturnRestaurantQuery {
  return {
    id: dto.id,
    name: dto.name,
    description: extras.description ?? '',
    cuisine: extras.cuisine ?? '',
    address: dto.address ?? extras.address ?? '',
    phone: dto.phone ?? extras.phone ?? '',
    email: extras.email,
    website: extras.website,
    rating: dto.averageRating ?? 0,
    reviewCount: extras.reviewCount ?? 0,
    priceRange: extras.priceRange ?? '$$',
    location: extras.location ?? '',
    hours: dto.openingHours ?? extras.hours ?? '',
    features: extras.features ?? [],
    image: dto.imageUrl ?? extras.image,
    isActive: dto.isActive,
    createdAt: extras.createdAt ?? new Date().toISOString(),
    updatedAt: extras.updatedAt ?? new Date().toISOString(),
  };
}

function mapRestaurantPage(
  page: PaginationData<RestaurantApiDto>,
  pageIndex: number
): ReturnRestaurantQueryPagination {
  const totalPages = page.pageSize > 0 ? Math.ceil(page.count / page.pageSize) : 1;
  return {
    restaurants: page.data.map((dto) => mapRestaurantDtoToView(dto)),
    totalCount: page.count,
    currentPage: pageIndex + 1,
    pageSize: page.pageSize,
    totalPages: Math.max(1, totalPages),
  };
}

/** @param page 1-based page number for UI */
export async function getAllRestaurants(
  page = 1,
  pageSize = 10,
  search?: string,
  sort?: string
): Promise<ReturnRestaurantQueryPagination> {
  const pageIndex = Math.max(0, page - 1);
  const qs = buildQueryString({
    PageIndex: pageIndex,
    PageSize: pageSize,
    Search: search,
    Sort: sort,
  });
  const response = await apiGet<RestaurantListApiResponse>(`${API.restaurant.list}${qs}`);
  const data = unwrapApiResponse(response);
  return mapRestaurantPage(data, pageIndex);
}

export async function getRestaurantById(id: number): Promise<ReturnRestaurantQuery> {
  const response = await apiGet<RestaurantApiResponse>(API.restaurant.byId(id));
  const dto = unwrapApiResponse(response);
  return mapRestaurantDtoToView(dto);
}

export async function deleteRestaurant(id: number): Promise<void> {
  const response = await apiDelete<ApiResponse<string>>(API.restaurant.delete(id));
  unwrapApiResponse(response);
}

export async function addReview(reviewData: AddReviewCommand) {
  const response = await reviewService.addReview(
    reviewData.restaurantId,
    reviewData.rating,
    reviewData.comment
  );
  return unwrapApiResponse(response);
}
