export type JwtPayload = Record<string, unknown>;

export function parseJwtPayload(token: string): JwtPayload {
  const parts = token.split('.');
  if (parts.length !== 3) return {};

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as JwtPayload;
  } catch {
    return {};
  }
}

const RESTAURANT_ID_KEYS = [
  'RestaurantId',  // Backend looks for this exact key
  'restaurantId',
  'restaurant_id',
  'RestaurantID'
];

import { ROLE_ID_TO_NAME } from './role-mapping';

export function getRolesFromToken(token: string): string[] {
  const payload = parseJwtPayload(token);

  const roleId = String(payload.RoleId ?? '');

  if (!roleId) return [];

  return ROLE_ID_TO_NAME[roleId]
    ? [ROLE_ID_TO_NAME[roleId]]
    : [];
}

export function getRestaurantIdFromToken(token: string): number | null {
  const payload = parseJwtPayload(token);
  for (const key of RESTAURANT_ID_KEYS) {
    const value = payload[key];
    if (value !== undefined && value !== null && value !== '') {
      const id = Number(value);
      if (!Number.isNaN(id) && id > 0) return id;
    }
  }
  return null;
}
