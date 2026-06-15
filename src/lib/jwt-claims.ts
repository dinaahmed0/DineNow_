// export type JwtPayload = Record<string, unknown>;

// export function parseJwtPayload(token: string): JwtPayload {
//   const parts = token.split('.');
//   if (parts.length !== 3) return {};

//   try {
//     const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
//     const json = atob(base64);
//     return JSON.parse(json) as JwtPayload;
//   } catch {
//     return {};
//   }
// }

// import { ROLE_ID_TO_NAME } from './role-mapping';

// function normalizeClaimValue(value: unknown): string[] {
//   if (value === undefined || value === null) return [];
//   if (Array.isArray(value)) return value.map(String);
//   return [String(value)];
// }

// const ROLE_CLAIM_KEYS = [
//   'role',
//   'roles',
//   'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
//   'http://schemas.microsoft.com/ws/2005/05/identity/claims/role',
//   'RoleId',
//   'roleId',
//   'roleID',
// ];

// const RESTAURANT_ID_KEYS = ['RestaurantId', 'restaurantId', 'restaurant_id', 'RestaurantID'];

// export function getRolesFromToken(token: string): string[] {
//   const payload = parseJwtPayload(token);
//   const roles = new Set<string>();

//   for (const key of ROLE_CLAIM_KEYS) {
//     normalizeClaimValue(payload[key]).forEach((r) => {
//       if (ROLE_ID_TO_NAME[r]) {
//         roles.add(ROLE_ID_TO_NAME[r]);
//       } else {
//         roles.add(r);
//       }
//     });
//   }

//   return Array.from(roles);
// }

// export function getRestaurantIdFromToken(token: string): number | null {
//   const payload = parseJwtPayload(token);
//   for (const key of RESTAURANT_ID_KEYS) {
//     const value = payload[key];
//     if (value !== undefined && value !== null && value !== '') {
//       const id = Number(value);
//       if (!Number.isNaN(id) && id > 0) return id;
//     }
//   }
//   return null;
// }


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

// function normalizeClaimValue(value: unknown): string[] {
//   if (value === undefined || value === null) return [];
//   if (Array.isArray(value)) return value.map(String);
//   return [String(value)];
// }

// These keys match what your backend expects
// const ROLE_CLAIM_KEYS = [
//   'role',
//   'roles',
//   'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',  // Backend's ClaimTypes.Role
//   'http://schemas.microsoft.com/ws/2005/05/identity/claims/role',
//   'RoleId',
//   'roleId',
//   'roleID',
// ];

const RESTAURANT_ID_KEYS = [
  'RestaurantId',  // Backend looks for this exact key
  'restaurantId', 
  'restaurant_id', 
  'RestaurantID'
];

const USER_ID_KEYS = [
  'nameidentifier',
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier', // Backend's ClaimTypes.NameIdentifier
  'sub',
  'userId',
  'UserId',
  'user_id'
];

import { ROLE_ID_TO_NAME } from './role-mapping';

// export function getRolesFromToken(token: string): string[] {
//   const payload = parseJwtPayload(token);
//   const roles = new Set<string>();

//   for (const key of ROLE_CLAIM_KEYS) {
//     normalizeClaimValue(payload[key]).forEach((r) => {
//       // If backend sends RoleId GUIDs, map them to role names.
//       if (ROLE_ID_TO_NAME[r]) {
//         roles.add(ROLE_ID_TO_NAME[r]);
//       } else {
//         roles.add(r);
//       }
//     });
//   }

//   return Array.from(roles);
// }

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

export function getUserIdFromToken(token: string): string | null {
  const payload = parseJwtPayload(token);
  for (const key of USER_ID_KEYS) {
    const value = payload[key];
    if (value !== undefined && value !== null && value !== '') {
      return String(value);
    }
  }
  return null;
}

// Debug function to log all claims in token
export function debugJwtToken(token: string): void {
  const payload = parseJwtPayload(token);
  console.log('JWT Claims:', payload);
  console.log('User ID (backend expects nameidentifier):', getUserIdFromToken(token));
  console.log('Restaurant ID (backend expects RestaurantId):', getRestaurantIdFromToken(token));
  console.log('Role (backend expects role):', getRolesFromToken(token));
}

















