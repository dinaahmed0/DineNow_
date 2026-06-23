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

export async function createCategory(command: AddCategoryCommand): Promise<CategoryResponse> {
  return apiPost<CategoryResponse>(API.category.create, command);
}

export async function updateCategory(command: UpdateCategoryCommand): Promise<CategoryResponse> {
  return apiPut<CategoryResponse>(API.category.update, command);
}

export async function deleteCategory(id: number): Promise<MenuActionResponse> {
  return apiDelete<MenuActionResponse>(API.category.delete(id));
}

export async function getMenuItemsByCategory(categoryId: number): Promise<MenuItemListResponse> {
  return apiGet<MenuItemListResponse>(API.menuItem.byCategory(categoryId));
}

export async function createMenuItem(command: AddMenuItemCommand): Promise<MenuItemResponse> {
  // Backend only accepts multipart/form-data for this endpoint (it takes an optional Image file).
  const body = new FormData();
  body.append('Name', command.name);
  body.append('Description', command.description);
  body.append('Price', String(command.price));
  body.append('CategoryId', String(command.categoryId));
  if (command.image) body.append('Image', command.image);
  return apiPost<MenuItemResponse>(API.menuItem.create, body);
}

export async function updateMenuItem(command: UpdateMenuItemCommand): Promise<MenuItemResponse> {
  const body = new FormData();
  body.append('Id', String(command.id));
  if (command.name !== undefined) body.append('Name', command.name);
  if (command.description !== undefined) body.append('Description', command.description);
  if (command.price !== undefined) body.append('Price', String(command.price));
  if (command.image) body.append('Image', command.image);
  return apiPut<MenuItemResponse>(API.menuItem.update, body);
}

export async function deleteMenuItem(id: number): Promise<MenuActionResponse> {
  return apiDelete<MenuActionResponse>(API.menuItem.delete(id));
}
