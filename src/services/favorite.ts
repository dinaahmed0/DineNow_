import { apiGet, apiPost, apiDelete } from './api/client';
import { API } from '../constants/api';
import type { FavoriteListResponse } from '../types/favorite';
import type { ApiResponse } from '../types/common';

export async function getFavorites(): Promise<FavoriteListResponse> {
  return apiGet<FavoriteListResponse>(API.favorite.list);
}

export async function addFavorite(restaurantId: number): Promise<ApiResponse<string>> {
  return apiPost<ApiResponse<string>>(API.favorite.add(restaurantId), {});
}

export async function removeFavorite(restaurantId: number): Promise<ApiResponse<string>> {
  return apiDelete<ApiResponse<string>>(API.favorite.remove(restaurantId));
}
