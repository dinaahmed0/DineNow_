import { getRolesFromToken } from './jwt-claims';
import { APP_ROUTES } from '../constants/routes';

export const USER_ROLES = {
  superAdmin: ['SuperAdmin', 'Admin', 'Administrator', 'superadmin', 'administrator'],
  manager: ['Manager', 'Owner', 'RestaurantOwner', 'RestaurantManager'],
  staff: ['Staff', 'Employee', 'Waiter'],
} as const;

function matchesRole(userRole: string, allowed: readonly string[]): boolean {
  const normalized = userRole.toLowerCase();
  return allowed.some((r) => r.toLowerCase() === normalized);
}

export function hasAnyRole(token: string, allowed: readonly string[]): boolean {
  const roles = getRolesFromToken(token);
  if (roles.length === 0) return false;
  return roles.some((r) => matchesRole(r, allowed));
}

export function isSuperAdmin(token: string): boolean {
  return hasAnyRole(token, USER_ROLES.superAdmin);
}

export function isManager(token: string): boolean {
  return hasAnyRole(token, USER_ROLES.manager);
}

export function isStaff(token: string): boolean {
  return hasAnyRole(token, USER_ROLES.staff);
}

export function getPrimaryRoleLabel(token: string): string {
  const roles = getRolesFromToken(token);
  if (roles.length === 0) return 'User';
  return roles[0];
}

/** Where a user should land after authenticating, based on their role. */
export function getPostLoginRoute(token: string): string {
  if (isSuperAdmin(token)) return APP_ROUTES.superAdmin;
  if (isManager(token)) return APP_ROUTES.managerDashboard;
  if (isStaff(token)) return APP_ROUTES.staffDashboard;
  return APP_ROUTES.home;
}
