import type { ApiResponse } from './common';

export interface BasketItem {
  id: number;
  itemName: string;
  imageUrl?: string;
  price: number;
  category: string;
  restaurantName: string;
  quantity: number;
}

export interface CustomerBasket {
  id: string;
  items: BasketItem[];
  paymentIntentId?: string;
  clientSecret?: string;
}

export type CustomerBasketResponse = ApiResponse<CustomerBasket>;
