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

type ValidationErrors = string[] | Record<string, string[]>;

interface ErrorPayload {
  message?: string;
  errors?: ValidationErrors;
  Message?: string;
  Errors?: ValidationErrors;
  succeeded?: boolean;
  title?: string;
}

/** ASP.NET model-validation 400s use { errors: { FieldName: ["msg"] }, title: "..." } instead of our { message } envelope. */
function firstValidationMessage(errors: ValidationErrors | undefined): string | undefined {
  if (!errors) return undefined;
  if (Array.isArray(errors)) return errors[0];
  for (const messages of Object.values(errors)) {
    if (messages?.length) return messages[0];
  }
  return undefined;
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

const toError = (status: number, statusText: string, payload?: ErrorPayload | string): Error => {
  if (typeof payload === 'string') {
    if (payload.trim()) return new Error(payload);
    payload = undefined;
  }
  const firstApiError = firstValidationMessage(payload?.errors) || firstValidationMessage(payload?.Errors);
  const message =
    payload?.message || payload?.Message || firstApiError || payload?.title || `Request failed: ${status} - ${statusText}`;
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
    const responseData = error.response?.data as ErrorPayload | string | undefined;

    // Some endpoints return HTTP 5xx with a body that says succeeded: true
    // (a backend bug where the real status code gets overwritten after a
    // success response is built). Trust the envelope over the transport status.
    if (status >= 500 && typeof responseData === 'object' && responseData?.succeeded === true && error.response) {
      return error.response;
    }

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

    // Log server errors and validation failures — the console's auto-generated
    // "GET url 400" line never shows the response body, which is where ASP.NET
    // puts the actual validation detail (errors/message).
    if (status >= 400) {
      console.error('API error', {
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

// The instance default Content-Type is 'application/json'. Axios's request
// transformer checks that header *before* checking whether the payload is
// FormData — if it sees 'application/json' it JSON-stringifies the FormData
// (Files turn into '{}') instead of sending real multipart/form-data. Clearing
// the header for FormData payloads lets axios fall through to its normal
// "let the browser set the multipart boundary" path.
function requestConfig(data: unknown) {
  return data instanceof FormData ? { headers: { 'Content-Type': undefined } } : undefined;
}

// API methods (matching your existing interface)
export async function apiGet<T>(path: string): Promise<T> {
  const response = await apiClient.get<T>(path);
  return response.data;
}

export async function apiPost<T>(path: string, data: unknown): Promise<T> {
  const response = await apiClient.post<T>(path, data, requestConfig(data));
  return response.data;
}

export async function apiPatch<T>(path: string, data: unknown): Promise<T> {
  const response = await apiClient.patch<T>(path, data, requestConfig(data));
  return response.data;
}

export async function apiPut<T>(path: string, data: unknown): Promise<T> {
  const response = await apiClient.put<T>(path, data, requestConfig(data));
  return response.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const response = await apiClient.delete<T>(path);
  return response.data;
}

// Export the axios instance for advanced use cases
export { apiClient };
