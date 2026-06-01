/** Central service exports aligned with backend API groups */
export * from './auth';
export * from './reservation';
export * from './restaurant';
export * from './reviewService';
export * from './notification';
export * from './table';
export { apiGet, apiPost, apiPut, apiPatch, apiDelete, apiClient, API_BASE_URL } from './api/client';
