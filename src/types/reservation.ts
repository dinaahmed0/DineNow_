import type { ApiResponse } from './common';

export interface CreateReservationCommand {
  restaurantId: number;
  startDateTime: string;
  endDateTime: string;
  numberOfGuests: number;
  notes: string;
}

export interface ReservationUserItem {
  id: number;
  userName: string;
  restaurantName: string;
  restaurantId: number;
  tableNumber: number;
  startDateTime: string;
  endDateTime: string;
  numberOfGuests: number;
  bookNumber: number;
  status: string;
  notes: string;
  createdAt: string;
}

export interface PaginationData<T> {
  pageIndex: number;
  pageSize: number;
  count: number;
  data: T[];
}

export interface UserReservationsFilters {
  status?: number[];
  restaurantId?: number;
  date?: string;
  from?: string;
  to?: string;
  pageIndex?: number;
  pageSize?: number;
}

export interface ReservationStaffItem {
  id: number;
  userName: string;
  tableNumber: number;
  startDateTime: string;
  endDateTime: string;
  numberOfGuests: number;
  status: string;
  assignedAt?: string;
  assignedBy?: string;
  notes: string;
  createdAt: string;
}

export interface ReservationSuggestion {
  suggestionId: number;
  tableNumber: number;
  startTime: string;
  endTime: string;
  expiresAt: string;
}

export interface ReservationIdCommand {
  reservationId: number;
}

export interface CheckInCommand {
  qrCode: string;
}

/** Create may return the command echo or a full user reservation row depending on API version. */
export type ReservationCreateData = CreateReservationCommand & Partial<ReservationUserItem>;

export type ReservationCreateResponse = ApiResponse<ReservationCreateData>;
export type ReservationUserDetailsResponse = ApiResponse<ReservationUserItem>;
export type ReservationUserListResponse = ApiResponse<PaginationData<ReservationUserItem>>;
export type ReservationStaffDetailsResponse = ApiResponse<ReservationStaffItem>;
export type ReservationStaffListResponse = ApiResponse<PaginationData<ReservationStaffItem>>;
export type ReservationActionResponse = ApiResponse<string>;
export type ReservationSuggestionsResponse = ApiResponse<ReservationSuggestion[]>;

