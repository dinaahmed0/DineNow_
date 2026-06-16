# API integration audit

Base URL: `VITE_API_BASE_URL` (default `https://reservationproj.runasp.net`)

All responses use the envelope: `{ statusCode, meta, succeeded, message, errors, data }`.

## Account — implemented

| Endpoint | Service | UI |
|----------|---------|-----|
| POST `/api/Account/register` | `registerUser` | Signup |
| POST `/api/Account/ResentOtp` | `resendOtp` | Email confirmation |
| POST `/api/Account/verify-email` | `verifyEmail` | Email confirmation |
| POST `/api/Account/login` | `loginUser` | Login, AuthContext |
| POST `/api/Account/ForgetPassword` | `forgotPassword` | Forgot password |
| POST `/api/Account/ResetPassword` | `resetPassword` | Reset password |
| POST `/api/Account/ChangePassword` | `changePassword` | Profile |
| POST `/api/Account/refresh` | `refreshToken` + axios interceptor | Auto refresh on 401 |
| POST `/api/Account/InviteStaff` | `inviteStaff` | **Service only** |
| POST `/api/Account/register-Staff` | `registerStaff` | **Service only** |
| GET `/api/Account/staff` | `getStaffMembers` | **Service only** |
| PUT `/api/Account/block-staff` | `blockStaffMember` | **Service only** |

**Verified shapes:** Register/login/verify use `displayName`, `email`, `password`, `confirmPassword`. Reset uses `email`, `token`, `newPassword`. Refresh uses `accessToken` + `refreshToken`.

## Reservation — implemented

| Endpoint | Service | UI |
|----------|---------|-----|
| POST `/api/Reservation/Create` | `createReservation` | Reservation flow |
| GET `/api/Reservation/User/GetAllReservation` | `getAllUserReservations` | My reservations |
| GET `/api/Reservation/User/{id}` | `getUserReservationById` | **Service only** |
| PUT `/api/Reservation/Cancel` | `cancelReservation` | My reservations |
| GET `/api/Reservation/Staff/GetAllReservation` | `getAllStaffReservations` | Staff admin page |
| PUT `/api/Reservation/Approve` | `approveReservation` | Staff admin page |
| PUT `/api/Reservation/Reject` | `rejectReservation` | Staff admin page |
| PUT `/api/Reservation/Complete` | `completeReservation` | Staff admin page |
| PUT `/api/Reservation/Update-Time` | `updateReservationTime` | **Service only** |
| GET `/api/Reservation/{id}/suggestions` | `getReservationSuggestions` | **Service only** |
| POST `/api/Reservation/check-in` | `checkInReservation` | **Service only** |

**Fixes applied:** `pageIndex` is **0-based** (My reservations was using `1`). Status filtering supports numeric codes `0–6` and string names via `src/lib/reservation-status.ts`.

## Restaurant — implemented

| Endpoint | Service | UI |
|----------|---------|-----|
| GET `/api/Restaurant` | `getAllRestaurants` | Restaurant list, admin |
| GET `/api/Restaurant/{Id}` | `getRestaurantById` | Restaurant details |
| POST `/api/Restaurant` | `addRestaurant` | Admin form |
| PATCH `/api/Restaurant/Update` | `updateRestaurant` | Admin form |
| DELETE `/api/Restaurant?id={id}` | `deleteRestaurant` | Admin |
| POST `/api/Restaurant/add-review` | `addReview` | My reservations review modal |
| GET `/api/Restaurant/get-reviews` | `getReviews` | Review list (passes `RestaurantId`) |

**Note:** List/detail DTO only includes `id`, `name`, `isActive`, `averageRating`. Extra UI fields (cuisine, image, etc.) are filled with defaults unless the API is extended.

## Table — service only

| Endpoint | Service | UI |
|----------|---------|-----|
| GET/POST/PATCH/DELETE `/api/Table` | `table.ts` | **Not wired** — reservation does not pick tables from API |
| GET `/api/Table/available` | `getAvailableTables` | **Not wired** |

## Notification — service only

| Endpoint | Service | UI |
|----------|---------|-----|
| GET `/api/Notification` | `getNotifications` | **Not wired** (no navbar bell) |
| PUT `/api/Notification/{id}/read` | `markNotificationAsRead` | **Not wired** |
| DELETE `/api/Notification/{id}` | `deleteNotification` | **Not wired** |

## Still mock / local UI

- **Spots** (`Spots.tsx`) — hardcoded `mockSpots`, not `GET /api/Restaurant`
- **Favorites** — local mock list, no favorites API in Swagger
- **Food pre-order** on reservation — client-only, not in API

## Staff admin route

- `/admin/reservations` — `StaffReservations.tsx` (approve / reject / complete)
- Access gated by email containing `admin`, `staff`, or `owner` (replace with role claims when backend exposes roles)

## Recommended next steps

1. Wire **Spots** to `getAllRestaurants` and map DTO → cards.
2. Add **notification dropdown** in navbar using `getNotifications`.
3. Use **getAvailableTables** when creating a reservation (guests + time window).
4. Add **staff invite/register UI** for admins using `inviteStaff` / `registerStaff`.
5. Add **QR check-in** screen using `checkInReservation`.
