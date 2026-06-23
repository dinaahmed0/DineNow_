import { apiGet, apiPost, apiPut } from './api/client';
import { API } from '../constants/api';
import { buildQueryWithArray } from '../lib/api-helpers';
import { RESERVATION_STATUS_CODE } from '../lib/reservation-status';
import type {
  CreateReservationCommand,
  ReservationActionResponse,
  ReservationCreateResponse,
  ReservationIdCommand,
  ReservationStaffDetailsResponse,
  ReservationStaffListResponse,
  ReservationSuggestionsResponse,
  ReservationUserDetailsResponse,
  ReservationUserListResponse,
  ReservationUserItem,
  UserReservationsFilters,
  CheckInCommand,
} from '../types/reservation';

function isReservationUserItem(value: unknown): value is ReservationUserItem {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    typeof (value as ReservationUserItem).id === 'number'
  );
}

function matchesCreatePayload(
  item: ReservationUserItem,
  payload: CreateReservationCommand
): boolean {
  if (item.restaurantId !== payload.restaurantId) return false;
  const itemStart = new Date(item.startDateTime).getTime();
  const payloadStart = new Date(payload.startDateTime).getTime();
  return Math.abs(itemStart - payloadStart) < 60_000;
}

export async function resolveCreatedReservation(
  payload: CreateReservationCommand,
  createResponse: ReservationCreateResponse
): Promise<ReservationUserItem | null> {
  const raw = createResponse.data;
  if (isReservationUserItem(raw)) {
    return raw;
  }
  if (!createResponse.succeeded) return null;

  const pendingList = await getAllUserReservations({
    pageIndex: 0,
    pageSize: 20,
    status: [RESERVATION_STATUS_CODE.pending],
  });
  const pendingItems = pendingList.data?.data ?? [];
  const matchedPending = pendingItems.find((item) => matchesCreatePayload(item, payload));
  if (matchedPending) return matchedPending;

  const allList = await getAllUserReservations({ pageIndex: 0, pageSize: 20 });
  const allItems = allList.data?.data ?? [];
  return allItems.find((item) => matchesCreatePayload(item, payload)) ?? null;
}

function buildReservationQueryString(filters?: UserReservationsFilters): string {
  return buildQueryWithArray(
    {
      RestaurantId: filters?.restaurantId,
      Date: filters?.date,
      From: filters?.from,
      To: filters?.to,
      // Backend's GetAllReservation endpoints use 1-based PageIndex (PageIndex=1 is the first page).
      PageIndex: (filters?.pageIndex ?? 0) + 1,
      PageSize: filters?.pageSize,
      UserId: undefined,
    },
    { Status: filters?.status }
  );
}

export async function createReservation(
  command: CreateReservationCommand
): Promise<ReservationCreateResponse> {
  return apiPost<ReservationCreateResponse>(API.reservation.create, command);
}

/** Create reservation then resolve the persisted user row (id, pending status, book number). */
export async function createReservationRequest(command: CreateReservationCommand) {
  const response = await createReservation(command);
  if (!response.succeeded) {
    return { response, reservation: null as import('../types/reservation').ReservationUserItem | null };
  }
  const reservation = await resolveCreatedReservation(command, response);
  return { response, reservation };
}

export async function getAllUserReservations(
  filters?: UserReservationsFilters
): Promise<ReservationUserListResponse> {
  return apiGet<ReservationUserListResponse>(
    `${API.reservation.userList}${buildReservationQueryString(filters)}`
  );
}

export async function getAllStaffReservations(
  filters?: UserReservationsFilters & { userId?: string }
): Promise<ReservationStaffListResponse> {
  const qs = buildQueryWithArray(
    {
      UserId: filters?.userId,
      Date: filters?.date,
      From: filters?.from,
      To: filters?.to,
      // Backend's GetAllReservation endpoints use 1-based PageIndex (PageIndex=1 is the first page).
      PageIndex: (filters?.pageIndex ?? 0) + 1,
      PageSize: filters?.pageSize,
    },
    { Status: filters?.status }
  );
  return apiGet<ReservationStaffListResponse>(`${API.reservation.staffList}${qs}`);
}

export async function cancelReservation(
  reservationId: number
): Promise<ReservationActionResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationActionResponse>(API.reservation.cancel, body);
}

export async function approveReservation(
  reservationId: number
): Promise<ReservationStaffDetailsResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationStaffDetailsResponse>(API.reservation.approve, body);
}

export async function rejectReservation(
  reservationId: number
): Promise<ReservationActionResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationActionResponse>(API.reservation.reject, body);
}

export async function completeReservation(
  reservationId: number
): Promise<ReservationActionResponse> {
  const body: ReservationIdCommand = { reservationId };
  return apiPut<ReservationActionResponse>(API.reservation.complete, body);
}

export async function updateReservationTime(
  id: number,
  startDateTime: string,
  endDateTime: string
): Promise<ReservationUserDetailsResponse> {
  return apiPut<ReservationUserDetailsResponse>(API.reservation.updateTime, {
    id,
    startDateTime,
    endDateTime,
  });
}

export async function getReservationSuggestions(
  reservationId: number
): Promise<ReservationSuggestionsResponse> {
  return apiGet<ReservationSuggestionsResponse>(API.reservation.suggestions(reservationId));
}

export async function checkInReservation(qrCode: string): Promise<ReservationActionResponse> {
  const body: CheckInCommand = { qrCode };
  return apiPost<ReservationActionResponse>(API.reservation.checkIn, body);
}
