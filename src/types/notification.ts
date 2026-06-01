import type { ApiResponse } from './common';

export interface NotificationItem {
  id: number;
  title?: string;
  message?: string;
  isRead?: boolean;
  createdAt?: string;
}

export type NotificationListResponse = ApiResponse<NotificationItem[]>;
