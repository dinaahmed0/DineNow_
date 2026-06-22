import { apiGet, apiPost } from './api/client';
import { API } from '../constants/api';
import type {
  CreateOrderCommand,
  Order,
  OrderApiDto,
  OrderApiListResponse,
  OrderApiResponse,
  OrderListResponse,
  OrderResponse,
} from '../types/order';

function mapOrderDtoToView(dto: OrderApiDto): Order {
  return {
    ...dto,
    items: (dto.items ?? []).map((item) => ({
      id: item.id,
      itemId: item.itemId,
      itemName: item.itemName,
      imageUrl: item.PictureUrl ?? undefined,
      quantity: item.quantity,
      price: item.price,
    })),
  };
}

function mapOrderResponse(response: OrderApiResponse): OrderResponse {
  return { ...response, data: response.data ? mapOrderDtoToView(response.data) : response.data };
}

function mapOrderListResponse(response: OrderApiListResponse): OrderListResponse {
  return { ...response, data: response.data?.map(mapOrderDtoToView) ?? response.data };
}

export async function createOrder(command: CreateOrderCommand): Promise<OrderResponse> {
  const response = await apiPost<OrderApiResponse>(API.order.create, command);
  return mapOrderResponse(response);
}

export async function getUserOrders(): Promise<OrderListResponse> {
  const response = await apiGet<OrderApiListResponse>(API.order.userAll);
  return mapOrderListResponse(response);
}

export async function getUserOrderById(id: number): Promise<OrderResponse> {
  const response = await apiGet<OrderApiResponse>(API.order.userById(id));
  return mapOrderResponse(response);
}

export async function getRestaurantOrders(): Promise<OrderListResponse> {
  const response = await apiGet<OrderApiListResponse>(API.order.restaurantAll);
  return mapOrderListResponse(response);
}

export async function getRestaurantOrderById(id: number): Promise<OrderResponse> {
  const response = await apiGet<OrderApiResponse>(API.order.restaurantById(id));
  return mapOrderResponse(response);
}
