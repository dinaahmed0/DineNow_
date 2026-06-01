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

function normalizeClaimValue(value: unknown): string[] {
  if (value === undefined || value === null) return [];
  if (Array.isArray(value)) return value.map(String);
  return [String(value)];
}

const ROLE_CLAIM_KEYS = [
  'role',
  'roles',
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  'http://schemas.microsoft.com/ws/2005/05/identity/claims/role',
];

const RESTAURANT_ID_KEYS = ['RestaurantId', 'restaurantId', 'restaurant_id', 'RestaurantID'];

export function getRolesFromToken(token: string): string[] {
  const payload = parseJwtPayload(token);
  const roles = new Set<string>();

  for (const key of ROLE_CLAIM_KEYS) {
    normalizeClaimValue(payload[key]).forEach((r) => roles.add(r));
  }

  return Array.from(roles);
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
