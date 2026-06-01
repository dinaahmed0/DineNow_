export type ID = string | number;

export interface ApiResponse<T> {
  statusCode: number;
  meta?: string;
  succeeded: boolean;
  message: string;
  errors: string[];
  data: T;
}

export interface ApiError {
  message: string;
  status?: number;
  errors?: string[];
}

