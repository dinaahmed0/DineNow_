import { apiGet, apiPut, apiDelete } from './api/client';
import { API } from '../constants/api';
import type { NotificationListResponse } from '../types/notification';
import type { ApiResponse } from '../types/common';

export async function getNotifications(): Promise<NotificationListResponse> {
  return apiGet<NotificationListResponse>(API.notification.list);
}

export async function markNotificationAsRead(id: number): Promise<ApiResponse<unknown>> {
  return apiPut<ApiResponse<unknown>>(API.notification.markRead(id), {});
}

export async function deleteNotification(id: number): Promise<ApiResponse<unknown>> {
  return apiDelete<ApiResponse<unknown>>(API.notification.delete(id));
}
