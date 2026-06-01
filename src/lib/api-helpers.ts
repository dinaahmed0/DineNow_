import type { ApiResponse } from '../types/common';

export class ApiRequestError extends Error {
  readonly statusCode?: number;
  readonly errors: string[];

  constructor(message: string, statusCode?: number, errors: string[] = []) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

/** Unwrap standard backend envelope; throw if `succeeded` is false */
export function unwrapApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.succeeded) {
    throw new ApiRequestError(
      response.message || response.errors?.[0] || 'Request failed',
      response.statusCode,
      response.errors ?? []
    );
  }
  return response.data;
}

export function buildQueryString(
  params: Record<string, string | number | boolean | undefined | null>
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

/** Append multiple values for the same key (e.g. Status=0&Status=1) */
export function buildQueryWithArray(
  params: Record<string, string | number | boolean | undefined | null>,
  arrayParams: Record<string, (string | number)[] | undefined> = {}
): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    search.set(key, String(value));
  }
  for (const [key, values] of Object.entries(arrayParams)) {
    values?.forEach((v) => search.append(key, String(v)));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}
