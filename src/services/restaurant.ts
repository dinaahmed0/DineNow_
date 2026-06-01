import { apiGet, apiPost, apiPatch, apiDelete } from './api/client';
import { API } from '../constants/api';
import { buildQueryString, unwrapApiResponse } from '../lib/api-helpers';
import { reviewService } from './reviewService';
import type {
  AddRestaurantCommand,
  AddReviewCommand,
  CreateRestaurantApiCommand,
  GetReviewQueryPagination,
  RestaurantApiDto,
  RestaurantListApiResponse,
  RestaurantApiResponse,
  ReturnRestaurantQuery,
  ReturnRestaurantQueryPagination,
  UpdateRestaurantApiCommand,
  UpdateRestaurantCommand,
} from '../types/restaurant';
import type { ApiResponse } from '../types/common';
import type { PaginationData } from '../types/reservation';
import type { ReviewsListResponse } from './reviewService';

function mapRestaurantDtoToView(
  dto: RestaurantApiDto,
  extras: Partial<ReturnRestaurantQuery> = {}
): ReturnRestaurantQuery {
  return {
    id: dto.id,
    name: dto.name,
    description: extras.description ?? '',
    cuisine: extras.cuisine ?? '',
    address: extras.address ?? '',
    phone: extras.phone ?? '',
    email: extras.email,
    website: extras.website,
    rating: dto.averageRating ?? 0,
    reviewCount: extras.reviewCount ?? 0,
    priceRange: extras.priceRange ?? '$$',
    location: extras.location ?? '',
    hours: extras.hours ?? '',
    features: extras.features ?? [],
    image: extras.image,
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

function mapReviewsResponse(response: ReviewsListResponse): GetReviewQueryPagination {
  const reviews = response.data?.data ?? [];
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      restaurantId: 0,
      userId: 0,
      userName: r.userName,
      rating: r.rating,
      comment: r.comment,
      createdAt: '',
    })),
    totalCount: response.data?.count ?? reviews.length,
    currentPage: (response.data?.pageIndex ?? 0) + 1,
    pageSize: response.data?.pageSize ?? reviews.length,
    totalPages: Math.max(
      1,
      Math.ceil((response.data?.count ?? 0) / Math.max(response.data?.pageSize ?? 1, 1))
    ),
    averageRating,
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

export async function addRestaurant(
  restaurantData: AddRestaurantCommand,
  ownerEmail: string
): Promise<ReturnRestaurantQuery> {
  const body: CreateRestaurantApiCommand = {
    ownerEmail,
    name: restaurantData.name,
    address: restaurantData.address,
    phone: restaurantData.phone,
    isActive: true,
    openingHours: restaurantData.hours,
  };
  const response = await apiPost<RestaurantApiResponse>(API.restaurant.create, body);
  const dto = unwrapApiResponse(response);
  return mapRestaurantDtoToView(dto, {
    description: restaurantData.description,
    cuisine: restaurantData.cuisine,
    email: restaurantData.email,
    website: restaurantData.website,
    priceRange: restaurantData.priceRange,
    location: restaurantData.location,
    hours: restaurantData.hours,
    features: restaurantData.features,
    image: restaurantData.image,
  });
}

export async function updateRestaurant(
  restaurantData: UpdateRestaurantCommand
): Promise<ReturnRestaurantQuery> {
  const body: UpdateRestaurantApiCommand = {
    restaurantId: restaurantData.id,
    address: restaurantData.address ?? '',
    phone: restaurantData.phone ?? '',
    isActive: restaurantData.isActive ?? true,
    openingHours: restaurantData.hours ?? '',
  };
  const response = await apiPatch<RestaurantApiResponse>(API.restaurant.update, body);
  const dto = unwrapApiResponse(response);
  return mapRestaurantDtoToView(dto, restaurantData);
}

/** Swagger documents DELETE without id; some deployments accept id in path */
export async function deleteRestaurant(id: number): Promise<void> {
  await apiDelete<ApiResponse<string>>(`${API.restaurant.delete}/${id}`);
}

export async function addReview(reviewData: AddReviewCommand) {
  const response = await reviewService.addReview(
    reviewData.restaurantId,
    reviewData.rating,
    reviewData.comment
  );
  return unwrapApiResponse(response);
}

export async function getRestaurantReviews(
  restaurantId: number,
  page = 1,
  pageSize = 10
): Promise<GetReviewQueryPagination> {
  const response = await reviewService.getReviews({
    pageIndex: Math.max(0, page - 1),
    pageSize,
    restaurantId,
  });
  if (!response.succeeded) {
    throw new Error(response.message || 'Failed to load reviews');
  }
  return mapReviewsResponse(response);
}
