import type { ApiResponse } from './common';
import type { PaginationData } from './reservation';

export interface TableItem {
  tableNumber: number;
  capacity: number;
  restaurantId: number;
  isAvailable: boolean;
}

export interface CreateTableCommand {
  tableNumber: number;
  capacity: number;
}

export interface UpdateTableCommand {
  capacity: number;
}

export interface AvailableTablesFilters {
  pageIndex?: number;
  pageSize?: number;
  capacity?: number;
  sort?: string;
  guests?: number;
  start?: string;
  end?: string;
}

export type TableListResponse = ApiResponse<PaginationData<TableItem>>;
export type TableResponse = ApiResponse<TableItem>;
export type TableActionResponse = ApiResponse<string>;
