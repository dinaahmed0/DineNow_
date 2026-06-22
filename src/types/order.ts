import type { ApiResponse } from './common';

export interface OrderItem {
  id: number;
  itemId: number;
  itemName: string;
  imageUrl?: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  buyerEmail: string;
  orderDate: string;
  status: string;
  items: OrderItem[];
  deposit: number;
  total: number;
  paymentIntentId?: string;
}

/** Wire shape of ReturnOrderItemResponse — backend serializes this one field PascalCase unlike its siblings. */
export interface OrderItemApiDto {
  id: number;
  itemId: number;
  itemName: string;
  PictureUrl?: string | null;
  quantity: number;
  price: number;
}

/** Wire shape of ReturnOrderResponse from GET /api/Order/... */
export interface OrderApiDto {
  id: number;
  buyerEmail: string;
  orderDate: string;
  status: string;
  items: OrderItemApiDto[];
  deposit: number;
  total: number;
  paymentIntentId?: string;
}

export interface CreateOrderCommand {
  basketId: string;
  reservationId: number;
}

export type OrderApiResponse = ApiResponse<OrderApiDto>;
export type OrderApiListResponse = ApiResponse<OrderApiDto[]>;
export type OrderResponse = ApiResponse<Order>;
export type OrderListResponse = ApiResponse<Order[]>;
