import type { AuthTokens } from '../types/auth';

export const AUTH_SESSION_UPDATED_EVENT = 'auth:session-updated';

export type StoredAuthUser = AuthTokens & {
  accessToken?: string;
  refresh?: string;
};

export function readStoredUser(): StoredAuthUser | null {
  const raw = localStorage.getItem('user');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuthUser;
  } catch {
    return null;
  }
}

export function writeStoredUser(user: StoredAuthUser): void {
  localStorage.setItem('user', JSON.stringify(user));
  localStorage.setItem('tokenTimestamp', Date.now().toString());
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_UPDATED_EVENT, { detail: user }));
}

export function clearStoredUser(): void {
  localStorage.removeItem('user');
  localStorage.removeItem('tokenTimestamp');
  // Restaurant context cached for the previous session must not leak into the next login.
  localStorage.removeItem('restaurantId');
}

const DEV_SESSION_ID_KEY = 'devSessionId';

/**
 * Each `npm run dev` start gets a fresh build-time session id (see vite.config.ts).
 * If it doesn't match the one recorded from the previous run, the dev server was
 * restarted since the last page load — discard any leftover session so dev always
 * starts logged out, even if the stored token is still valid. No-op in production
 * builds, where sessions persist across reloads as normal.
 */
export function clearStaleDevSession(): void {
  if (!import.meta.env.DEV) return;

  const lastSessionId = localStorage.getItem(DEV_SESSION_ID_KEY);
  if (lastSessionId !== __DEV_SESSION_ID__) {
    clearStoredUser();
    localStorage.setItem(DEV_SESSION_ID_KEY, __DEV_SESSION_ID__);
  }
}

/** Returns true if JWT `exp` is in the past (or token is not a JWT). */
export function isAccessTokenExpired(token: string, skewMs = 30_000): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;

  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };
    if (!payload.exp) return false;
    return payload.exp * 1000 <= Date.now() + skewMs;
  } catch {
    return false;
  }
}

export function toAuthUser(stored: StoredAuthUser): AuthTokens {
  return {
    email: stored.email,
    displayName: stored.displayName,
    token: stored.token || stored.accessToken || '',
    refreshToken: stored.refreshToken || stored.refresh || '',
  };
}
