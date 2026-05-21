import type { PublicUser } from "./api";
import { notifyAuthChanged } from "./auth-events";

const TOKEN_KEY = "job_profile_token";
const USER_KEY = "job_profile_user";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getStoredUser(): PublicUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export function setSession(token: string, user: PublicUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  notifyAuthChanged();
}

export function updateStoredUser(user: PublicUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  notifyAuthChanged();
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  notifyAuthChanged();
}

/** @deprecated use clearSession */
export function clearToken() {
  clearSession();
}

export function isLoggedIn(): boolean {
  return Boolean(getToken());
}
