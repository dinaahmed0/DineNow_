import { apiGet, apiPost, apiDelete } from './api/client';
import { API } from '../constants/api';
import type { CustomerBasket, CustomerBasketResponse } from '../types/basket';
import type { ApiResponse } from '../types/common';

export async function createOrUpdateBasket(basket: CustomerBasket): Promise<CustomerBasketResponse> {
  return apiPost<CustomerBasketResponse>(API.basket.createOrUpdate, { customerBasket: basket });
}

export async function getBasket(): Promise<CustomerBasketResponse> {
  return apiGet<CustomerBasketResponse>(API.basket.current);
}

export async function deleteBasket(): Promise<ApiResponse<string>> {
  return apiDelete<ApiResponse<string>>(API.basket.current);
}
