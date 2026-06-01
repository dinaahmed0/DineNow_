// export const API_BASE_URL = 'https://reservationproj.runasp.net';

// interface ErrorPayload {
//   message?: string;
//   errors?: string[];
//   Message?: string;
//   Errors?: string[];
// }

// interface StoredUser {
//   email: string;
//   displayName: string;
//   token: string;
//   refreshToken: string;
//   accessToken?: string;
//   refresh?: string;
// }

// interface RefreshResponse {
//   succeeded: boolean;
//   message?: string;
//   data?: {
//     email?: string;
//     displayName?: string;
//     token?: string;
//     refreshToken?: string;
//   };
// }

// const getStoredUser = (): StoredUser | null => {
//   const userStr = localStorage.getItem('user');
//   if (!userStr) return null;

//   try {
//     return JSON.parse(userStr) as StoredUser;
//   } catch {
//     return null;
//   }
// };

// // Helper function to get auth token
// const getAuthToken = (): string | null => {
//   const user = getStoredUser();
//   return user?.token || user?.accessToken || null;
// };

// const toError = (status: number, statusText: string, payload?: ErrorPayload): Error => {
//   const errorList = payload?.errors || payload?.Errors;
//   const firstApiError = errorList?.[0];
//   const message = payload?.message || payload?.Message || firstApiError || `Request failed: ${status} - ${statusText}`;
//   return new Error(message);
// };

// const parseErrorPayload = async (response: Response): Promise<ErrorPayload | undefined> => {
//   const contentType = response.headers.get('content-type') || '';
//   if (contentType.includes('application/json')) {
//     return response.json().catch(() => undefined) as Promise<ErrorPayload | undefined>;
//   }

//   const text = await response.text().catch(() => '');
//   if (!text) return undefined;
//   return { message: text };
// };

// const refreshAccessToken = async (): Promise<boolean> => {
//   const user = getStoredUser();
//   const currentToken = user?.token || user?.accessToken || '';
//   const currentRefreshToken = user?.refreshToken || user?.refresh || '';
//   if (!currentRefreshToken) return false;

//   try {
//     const response = await fetch(`${API_BASE_URL}/api/Account/refresh`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // Some backends require the expired access token to be present even for refresh.
//         ...(currentToken ? { Authorization: `Bearer ${currentToken}` } : {}),
//       },
//       body: JSON.stringify({
//         accessToken: currentToken,
//         refreshToken: currentRefreshToken,
//       }),
//     });


//     if (!response.ok) {
//       return false;
//     }

//     const payload = (await response.json()) as RefreshResponse;
//     const nextToken = payload.data?.token || payload.data?.accessToken;
//     const nextRefresh = payload.data?.refreshToken || currentRefreshToken;
//     if (!payload.succeeded || !nextToken) {
//       return false;
//     }

//     const updatedUser: StoredUser = {
//       email: payload.data.email || user.email,
//       displayName: payload.data.displayName || user.displayName,
//       token: nextToken,
//       refreshToken: nextRefresh,
//     };

//     localStorage.setItem('user', JSON.stringify(updatedUser));
//     return true;
//   } catch {
//     return false;
//   }
// };

// const request = async <T>(
//   method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
//   path: string,
//   data?: unknown,
//   hasRetried = false
// ): Promise<T> => {
//   const token = getAuthToken();
//   const headers: Record<string, string> = {
//     ...(token && { Authorization: `Bearer ${token}` }),
//   };

//   if (method !== 'DELETE' || data !== undefined) {
//     headers['Content-Type'] = 'application/json';
//   }

//   const response = await fetch(`${API_BASE_URL}${path}`, {
//     method,
//     headers,
//     ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
//   });

//   if (!response.ok) {
//     if (response.status === 401 && !hasRetried && path !== '/api/Account/refresh') {
//       console.log('401 detected, attempting token refresh');
//       const refreshed = await refreshAccessToken();
//       if (refreshed) {
//         return request<T>(method, path, data, true);
//       }
//     }

//     const rawErrorBody = await response.clone().text().catch(() => '');
//     if (response.status >= 500) {
//       console.error('API server error', {
//         method,
//         path,
//         status: response.status,
//         statusText: response.statusText,
//         requestData: data,
//         responseBody: rawErrorBody,
//       });
//     }

//     const payload = await parseErrorPayload(response);
//     throw toError(response.status, response.statusText, payload);
//   }

//   if (response.status === 204) {
//     return null as T;
//   }

//   const contentType = response.headers.get('content-type') || '';
//   if (!contentType.includes('application/json')) {
//     const text = await response.text();
//     return text as T;
//   }

//   return response.json() as Promise<T>;
// };

// export async function apiGet<T>(path: string): Promise<T> {
//   return request<T>('GET', path);
// }

// export async function apiPost<T>(path: string, data: unknown): Promise<T> {
//   return request<T>('POST', path, data);
// }

// export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
//   return request<T>('PATCH', path, data);
// }

// export async function apiPut<T>(path: string, data: unknown): Promise<T> {
//   return request<T>('PUT', path, data);
// }

// export async function apiDelete<T>(path: string): Promise<T> {
//   return request<T>('DELETE', path);
// }










// client.ts - Axios version (compatible with Axios v0.x and v1.x)
import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { API, isPublicAuthEndpoint } from '../../constants/api';
import { APP_ROUTES } from '../../constants/routes';
import {
  clearStoredUser,
  readStoredUser,
  writeStoredUser,
  type StoredAuthUser,
} from '../../lib/auth-session';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://reservationproj.runasp.net';

interface ErrorPayload {
  message?: string;
  errors?: string[];
  Message?: string;
  Errors?: string[];
}

interface RefreshResponse {
  succeeded: boolean;
  message?: string;
  data?: {
    email?: string;
    displayName?: string;
    token?: string;
    refreshToken?: string;
  };
}

const getAuthToken = (): string | null => {
  const user = readStoredUser();
  return user?.token || user?.accessToken || null;
};

const toError = (status: number, statusText: string, payload?: ErrorPayload): Error => {
  const errorList = payload?.errors || payload?.Errors;
  const firstApiError = errorList?.[0];
  const message = payload?.message || payload?.Message || firstApiError || `Request failed: ${status} - ${statusText}`;
  return new Error(message);
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 second timeout
});

// Flag to prevent multiple refresh calls
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

// Refresh token function
const refreshAccessToken = async (): Promise<string | null> => {
  const user = readStoredUser();
  const currentToken = user?.token || user?.accessToken || '';
  const currentRefreshToken = user?.refreshToken || user?.refresh || '';
  
  if (!currentRefreshToken) return null;

  try {
    const response = await axios.post<RefreshResponse>(
      `${API_BASE_URL}${API.account.refresh}`,
      {
        accessToken: currentToken,
        refreshToken: currentRefreshToken,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const payload = response.data;
    const nextToken = payload.data?.token;
    const nextRefresh = payload.data?.refreshToken || currentRefreshToken;
    
    if (!payload.succeeded || !nextToken || !user) {
      return null;
    }

    const updatedUser: StoredAuthUser = {
      email: payload.data?.email || user.email,
      displayName: payload.data?.displayName || user.displayName,
      token: nextToken,
      refreshToken: nextRefresh,
      accessToken: nextToken,
      refresh: nextRefresh,
    };

    writeStoredUser(updatedUser);
    return nextToken;
  } catch (error) {
    console.error('Refresh token error:', error);
    return null;
  }
};

// Request interceptor - adds token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (!isPublicAuthEndpoint(config.url)) {
      const token = getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handles 401 and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Return the response directly for successful requests
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status || 500;
    const statusText = error.response?.statusText || 'Unknown Error';
    const responseData = error.response?.data as ErrorPayload | undefined;

    // Login/register/etc. — surface the real API error, never refresh or redirect
    if (isPublicAuthEndpoint(originalRequest.url)) {
      throw toError(status, statusText, responseData);
    }

    // Don't attempt refresh for refresh endpoint itself
    if (originalRequest.url?.includes(API.account.refresh)) {
      return Promise.reject(error);
    }

    // Check if it's a 401 and we haven't retried yet
    if (status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request while refresh is in progress
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }
      
      originalRequest._retry = true;
      isRefreshing = true;
      
      try {
        const newToken = await refreshAccessToken();
        
        if (newToken) {
          // Update the authorization header
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
          }
          
          // Process queued requests
          processQueue(null, newToken);
          
          // Retry the original request
          return apiClient(originalRequest);
        } else {
          processQueue(new Error('Refresh failed'), null);
          clearStoredUser();
          if (!window.location.pathname.includes(APP_ROUTES.login)) {
            window.location.href = APP_ROUTES.login;
          }
          return Promise.reject(error);
        }
      } catch (refreshError) {
        processQueue(refreshError as Error, null);
        clearStoredUser();
        if (!window.location.pathname.includes(APP_ROUTES.login)) {
          window.location.href = APP_ROUTES.login;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    
    // Log server errors
    if (status >= 500) {
      console.error('API server error', {
        method: originalRequest.method,
        path: originalRequest.url,
        status,
        statusText,
        requestData: originalRequest.data,
        responseBody: responseData,
      });
    }
    
    throw toError(status, statusText, responseData);
  }
);

// API methods (matching your existing interface)
export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<T>(path);
  return response.data;
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const response = await apiClient.post<T>(path, data);
  return response.data;
}

export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  const response = await apiClient.patch<T>(path, data);
  return response.data;
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const response = await apiClient.put<T>(path, data);
  return response.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await apiClient.delete<T>(path);
  return response.data;
}

// Export the axios instance for advanced use cases
export { apiClient };

