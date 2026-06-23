import { apiPost } from './api/client';
import { API } from '../constants/api';
import type {
  CreateOrderCommand,
  Order,
  OrderApiDto,
  OrderApiResponse,
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

export async function createOrder(command: CreateOrderCommand): Promise<OrderResponse> {
  const response = await apiPost<OrderApiResponse>(API.order.create, command);
  return mapOrderResponse(response);
}
