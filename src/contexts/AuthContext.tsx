import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import { loginUser as loginApiCall, refreshToken as refreshApiCall } from '../services/auth';
import type { AuthTokens, LoginResponse } from '../types/auth';
import {
  AUTH_SESSION_UPDATED_EVENT,
  clearStoredUser,
  isAccessTokenExpired,
  readStoredUser,
  toAuthUser,
  writeStoredUser,
  type StoredAuthUser,
} from '../lib/auth-session';

export type User = AuthTokens;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  authenticate: (userData: User) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  authError: string | null;
  refreshAccessToken: (sessionUser?: User) => Promise<boolean>;
  handleApiError: (error: unknown) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components -- context hook co-located with provider
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

const readAccessToken = (data: {
  token?: string;
  accessToken?: string;
  access_token?: string;
  AccessToken?: string;
}): string =>
  data.token || data.accessToken || data.access_token || data.AccessToken || '';

const readRefreshToken = (data: {
  refreshToken?: string;
  refresh?: string;
  refresh_token?: string;
  RefreshToken?: string;
}): string =>
  data.refreshToken || data.refresh || data.refresh_token || data.RefreshToken || '';

const TOKEN_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function isUnauthorizedError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes('401') || message.toLowerCase().includes('token expired');
}

async function refreshTokensForUser(currentUser: User): Promise<User | null> {
  if (!currentUser.refreshToken) {
    return null;
  }

  try {
    const response = await refreshApiCall({
      accessToken: currentUser.token,
      refreshToken: currentUser.refreshToken,
    });

    if (!response.succeeded || !response.data) {
      return null;
    }

    const accessToken = readAccessToken(response.data);
    const refreshToken = readRefreshToken(response.data);

    return {
      email: response.data.email || currentUser.email,
      displayName: response.data.displayName || currentUser.displayName,
      token: accessToken || currentUser.token,
      refreshToken: refreshToken || currentUser.refreshToken,
    };
  } catch (error) {
    console.error('Token refresh error:', error);
    return null;
  }
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const userRef = useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
    clearStoredUser();
  }, []);

  useEffect(() => {
    const onSessionUpdated = (event: Event) => {
      const detail = (event as CustomEvent<StoredAuthUser>).detail;
      if (!detail?.token) return;
      setUser(toAuthUser(detail));
      setIsAuthenticated(true);
      setAuthError(null);
    };

    window.addEventListener(AUTH_SESSION_UPDATED_EVENT, onSessionUpdated);
    return () => window.removeEventListener(AUTH_SESSION_UPDATED_EVENT, onSessionUpdated);
  }, []);

  const refreshAccessToken = useCallback(async (sessionUser?: User): Promise<boolean> => {
    const currentUser = sessionUser ?? userRef.current;

    if (!currentUser?.refreshToken) {
      return false;
    }

    const updatedUser = await refreshTokensForUser(currentUser);
    if (!updatedUser) {
      return false;
    }

    setUser(updatedUser);
    setIsAuthenticated(true);
    writeStoredUser(updatedUser);
    return true;
  }, []);

  const handleApiError = useCallback(async (error: unknown) => {
    if (!isUnauthorizedError(error)) {
      return;
    }

    const refreshed = await refreshAccessToken();
    if (!refreshed) {
      setAuthError('Your session has expired. Please sign in again.');
      logout();
    }
  }, [refreshAccessToken, logout]);

  useEffect(() => {
    let cancelled = false;

    const initializeAuth = async () => {
      setAuthError(null);
      const stored = readStoredUser();

      if (!stored?.token || !stored?.email) {
        clearStoredUser();
        if (!cancelled) setIsLoading(false);
        return;
      }

      try {
        let sessionUser = toAuthUser(stored);

        const tokenTimestamp = localStorage.getItem('tokenTimestamp');
        const isTimestampStale =
          tokenTimestamp && parseInt(tokenTimestamp, 10) < Date.now() - TOKEN_MAX_AGE_MS;
        const needsRefresh =
          Boolean(sessionUser.refreshToken) &&
          (isAccessTokenExpired(sessionUser.token) || isTimestampStale);

        if (needsRefresh) {
          const updatedUser = await refreshTokensForUser(sessionUser);
          if (cancelled) return;

          if (!updatedUser) {
            setAuthError('Your session has expired. Please sign in again.');
            clearStoredUser();
            if (!cancelled) setIsLoading(false);
            return;
          }

          sessionUser = updatedUser;
          writeStoredUser(updatedUser);
        } else if (!tokenTimestamp) {
          writeStoredUser(stored);
        }

        if (!cancelled) {
          setUser(sessionUser);
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error restoring session:', error);
        clearStoredUser();
        if (!cancelled) {
          setAuthError('Unable to restore your session. Please sign in again.');
          setIsLoading(false);
        }
      }
    };

    void initializeAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = async (email: string, password: string) => {
    // Avoid sending a stale Bearer token on the login request
    clearStoredUser();
    setUser(null);
    setIsAuthenticated(false);

    const response: LoginResponse = await loginApiCall({ email, password });

    if (!response.succeeded || !response.data) {
      throw new Error(response.message || response.errors?.[0] || 'Login failed');
    }

    const accessToken = readAccessToken(response.data);
    const refreshToken = readRefreshToken(response.data);

    if (!accessToken) {
      throw new Error('Login succeeded but no access token was returned. Please try again.');
    }

    const userData: User = {
      email: response.data.email || email,
      displayName: response.data.displayName || 'User',
      token: accessToken,
      refreshToken,
    };

    setAuthError(null);
    setUser(userData);
    setIsAuthenticated(true);
    setIsLoading(false);
    writeStoredUser(userData);
  };

  const authenticate = (userData: User) => {
    setAuthError(null);
    setUser(userData);
    setIsAuthenticated(true);
    writeStoredUser(userData);
  };

  const value: AuthContextType = {
    user,
    login,
    logout,
    authenticate,
    isAuthenticated,
    isLoading,
    authError,
    refreshAccessToken,
    handleApiError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
