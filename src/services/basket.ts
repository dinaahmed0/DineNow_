import { apiPost } from './api/client';
import { API } from '../constants/api';
import type { CustomerBasket, CustomerBasketResponse } from '../types/basket';

export async function createOrUpdateBasket(basket: CustomerBasket): Promise<CustomerBasketResponse> {
  return apiPost<CustomerBasketResponse>(API.basket.createOrUpdate, { customerBasket: basket });
}
