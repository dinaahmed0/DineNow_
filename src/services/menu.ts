import { apiGet, apiPost, apiPut, apiDelete } from './api/client';
import { API } from '../constants/api';
import { buildQueryString } from '../lib/api-helpers';
import type {
  AddCategoryCommand,
  AddMenuItemCommand,
  CategoryListResponse,
  CategoryResponse,
  MenuActionResponse,
  MenuItemListResponse,
  MenuItemResponse,
  UpdateCategoryCommand,
  UpdateMenuItemCommand,
} from '../types/menu';

export async function getCategories(restaurantId?: number): Promise<CategoryListResponse> {
  const qs = buildQueryString({ restaurantId });
  return apiGet<CategoryListResponse>(`${API.category.list}${qs}`);
}

export async function getCategoryById(id: number): Promise<CategoryResponse> {
  return apiGet<CategoryResponse>(API.category.byId(id));
}

export async function createCategory(command: AddCategoryCommand): Promise<CategoryResponse> {
  return apiPost<CategoryResponse>(API.category.create, command);
}

export async function updateCategory(command: UpdateCategoryCommand): Promise<CategoryResponse> {
  return apiPut<CategoryResponse>(API.category.update, command);
}

export async function deleteCategory(id: number): Promise<MenuActionResponse> {
  return apiDelete<MenuActionResponse>(API.category.delete(id));
}

export async function getMenuItemById(id: number): Promise<MenuItemResponse> {
  return apiGet<MenuItemResponse>(API.menuItem.byId(id));
}

export async function getMenuItemsByCategory(categoryId: number): Promise<MenuItemListResponse> {
  return apiGet<MenuItemListResponse>(API.menuItem.byCategory(categoryId));
}

export async function createMenuItem(command: AddMenuItemCommand): Promise<MenuItemResponse> {
  return apiPost<MenuItemResponse>(API.menuItem.create, command);
}

export async function updateMenuItem(command: UpdateMenuItemCommand): Promise<MenuItemResponse> {
  return apiPut<MenuItemResponse>(API.menuItem.update, command);
}

export async function deleteMenuItem(id: number): Promise<MenuActionResponse> {
  return apiDelete<MenuActionResponse>(API.menuItem.delete(id));
}
