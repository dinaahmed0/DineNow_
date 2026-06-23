import type { ApiResponse } from './common';

/** Shape returned by GET /api/Category and GET /api/Category/{id} */
export interface MenuCategory {
  id: number;
  name: string;
}

/** Shape returned by GET /api/MenuItem/{id} and GET /api/MenuItem/category/{categoryId} */
export interface MenuItem {
  id: number;
  name: string;
  categoryName: string;
  description: string;
  imageUrl?: string | null;
  price: number;
}

export interface AddCategoryCommand {
  name: string;
}

export interface UpdateCategoryCommand {
  id: number;
  name: string;
}

export interface AddMenuItemCommand {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  image?: File | null;
}

export interface UpdateMenuItemCommand {
  id: number;
  name?: string;
  description?: string;
  price?: number;
  image?: File | null;
}

export type CategoryListResponse = ApiResponse<MenuCategory[]>;
export type CategoryResponse = ApiResponse<MenuCategory>;
export type MenuItemListResponse = ApiResponse<MenuItem[]>;
export type MenuItemResponse = ApiResponse<MenuItem>;
export type MenuActionResponse = ApiResponse<string>;
