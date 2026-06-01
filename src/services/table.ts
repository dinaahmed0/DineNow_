import { apiGet, apiPost, apiPatch, apiDelete } from './api/client';
import { API } from '../constants/api';
import { buildQueryString } from '../lib/api-helpers';
import type {
  AvailableTablesFilters,
  CreateTableCommand,
  TableActionResponse,
  TableListResponse,
  TableResponse,
  UpdateTableCommand,
} from '../types/table';

export async function getTables(filters?: {
  pageIndex?: number;
  pageSize?: number;
  capacity?: number;
  sort?: string;
}): Promise<TableListResponse> {
  const qs = buildQueryString({
    PageIndex: filters?.pageIndex,
    PageSize: filters?.pageSize,
    Capacity: filters?.capacity,
    Sort: filters?.sort,
  });
  return apiGet<TableListResponse>(`${API.table.list}${qs}`);
}

export async function getTableByNumber(tableNum: number): Promise<TableResponse> {
  return apiGet<TableResponse>(API.table.byNumber(tableNum));
}

export async function createTable(command: CreateTableCommand): Promise<TableResponse> {
  return apiPost<TableResponse>(API.table.create, command);
}

export async function updateTable(command: UpdateTableCommand): Promise<TableResponse> {
  return apiPatch<TableResponse>(API.table.update, command);
}

export async function deleteTable(tableNum: number): Promise<TableActionResponse> {
  return apiDelete<TableActionResponse>(API.table.byNumber(tableNum));
}

export async function getAvailableTables(filters: AvailableTablesFilters): Promise<TableListResponse> {
  const qs = buildQueryString({
    'SpecParams.PageIndex': filters.pageIndex,
    'SpecParams.PageSize': filters.pageSize,
    'SpecParams.Capacity': filters.capacity,
    'SpecParams.Sort': filters.sort,
    Guests: filters.guests,
    Start: filters.start,
    End: filters.end,
  });
  return apiGet<TableListResponse>(`${API.table.available}${qs}`);
}
