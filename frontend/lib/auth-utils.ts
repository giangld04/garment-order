// JWT token storage helpers using localStorage
// Guards all calls with typeof window check for SSR safety

import type { User } from '@/types/user';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user_data';

const isBrowser = typeof window !== 'undefined';

export const getAccessToken = (): string | null =>
  isBrowser ? localStorage.getItem(ACCESS_TOKEN_KEY) : null;

export const setAccessToken = (token: string): void => {
  if (isBrowser) localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getRefreshToken = (): string | null =>
  isBrowser ? localStorage.getItem(REFRESH_TOKEN_KEY) : null;

export const setRefreshToken = (token: string): void => {
  if (isBrowser) localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

export const setUser = (user: User): void => {
  if (isBrowser) localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  if (!isBrowser) return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const clearAuth = (): void => {
  if (!isBrowser) return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const isAuthenticated = (): boolean => !!getAccessToken();
