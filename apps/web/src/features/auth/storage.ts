import { AUTH_STORAGE_KEY } from "./constants";
import type { AuthState } from "./state";

export function saveAuthState(state: AuthState): void {
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify(state)
  );
}

export function loadAuthState(): AuthState | null {
  const raw = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthState;
  } catch {
    return null;
  }
}

export function clearAuthState(): void {
  localStorage.removeItem(AUTH_STORAGE_KEY);
}
