/** Endpoints that must not trigger token-refresh on 401 */
export const PUBLIC_AUTH_ENDPOINTS = [
  '/api/Account/login',
  '/api/Account/register',
  '/api/Account/ForgetPassword',
  '/api/Account/ResetPassword',
  '/api/Account/verify-email',
  '/api/Account/ResentOtp',
  '/api/Account/register-Staff',
] as const;

export function isPublicAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return PUBLIC_AUTH_ENDPOINTS.some((path) => url.includes(path));
}

/** Backend route paths — keep in sync with Swagger */
export const API = {
  account: {
    register: '/api/Account/register',
    resendOtp: '/api/Account/ResentOtp',
    verifyEmail: '/api/Account/verify-email',
    login: '/api/Account/login',
    forgetPassword: '/api/Account/ForgetPassword',
    resetPassword: '/api/Account/ResetPassword',
    changePassword: '/api/Account/ChangePassword',
    inviteStaff: '/api/Account/InviteStaff',
    registerStaff: '/api/Account/register-Staff',
    refresh: '/api/Account/refresh',
    staffList: '/api/Account/staff',
    blockStaff: '/api/Account/block-staff',
  },
  notification: {
    list: '/api/Notification',
    markRead: (id: number) => `/api/Notification/${id}/read`,
    delete: (id: number) => `/api/Notification/${id}`,
  },
  reservation: {
    create: '/api/Reservation/Create',
    userById: (id: number) => `/api/Reservation/User/${id}`,
    userList: '/api/Reservation/User/GetAllReservation',
    staffById: (id: number) => `/api/Reservation/Staff/${id}`,
    staffList: '/api/Reservation/Staff/GetAllReservation',
    approve: '/api/Reservation/Approve',
    reject: '/api/Reservation/Reject',
    cancel: '/api/Reservation/Cancel',
    updateTime: '/api/Reservation/Update-Time',
    complete: '/api/Reservation/Complete',
    suggestions: (id: number) => `/api/Reservation/${id}/suggestions`,
    checkIn: '/api/Reservation/check-in',
  },
  restaurant: {
    list: '/api/Restaurant',
    byId: (id: number) => `/api/Restaurant/${id}`,
    create: '/api/Restaurant',
    update: '/api/Restaurant/Update',
    delete: (id: number) => `/api/Restaurant?RestaurantId=${id}`,
    addReview: '/api/Restaurant/add-review',
    getReviews: '/api/Restaurant/get-reviews',
  },
  table: {
    list: '/api/Table',
    create: '/api/Table',
    update: '/api/Table',
    byNumber: (tableNum: number) => `/api/Table/${tableNum}`,
    available: '/api/Table/available',
  },
  category: {
    list: '/api/Category',
    byId: (id: number) => `/api/Category/${id}`,
    create: '/api/Category',
    update: '/api/Category',
    delete: (id: number) => `/api/Category/${id}`,
  },
  menuItem: {
    byId: (id: number) => `/api/MenuItem/${id}`,
    byCategory: (categoryId: number) => `/api/MenuItem/category/${categoryId}`,
    create: '/api/MenuItem',
    update: '/api/MenuItem',
    delete: (id: number) => `/api/MenuItem/${id}`,
  },
  basket: {
    createOrUpdate: '/api/Basket',
    current: '/api/Basket',
  },
  order: {
    create: '/api/Order/Create',
    userAll: '/api/Order/User/GetAll',
    userById: (id: number) => `/api/Order/User/${id}`,
    restaurantAll: '/api/Order/Restaurant/GetAll',
    restaurantById: (id: number) => `/api/Order/Restaurant/${id}`,
  },
  payment: {
    createIntent: '/api/Payment',
  },
  favorite: {
    list: '/api/Favorite',
    add: (restaurantId: number) => `/api/Favorite/${restaurantId}`,
    remove: (restaurantId: number) => `/api/Favorite/${restaurantId}`,
  },
} as const;
