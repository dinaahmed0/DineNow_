import { apiPost } from './api/client';
import { API } from '../constants/api';
import type { CustomerBasketResponse } from '../types/basket';

export async function createPaymentIntent(): Promise<CustomerBasketResponse> {
  return apiPost<CustomerBasketResponse>(API.payment.createIntent, {});
}
