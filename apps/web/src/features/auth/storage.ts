import { AUTH_STORAGE_KEY } from "./constants";
import type { AuthState } from "./state";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function saveAuthState(
  state: AuthState,
): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify(state),
    );
  } catch (error) {
    console.error(
      "Failed to save auth state:",
      error,
    );
  }
}

export function loadAuthState():
  | AuthState
  | null {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(
      AUTH_STORAGE_KEY,
    );

    if (!raw) {
      return null;
    }

    const state = JSON.parse(raw) as AuthState;

    if (
      state.expiresAt &&
      state.expiresAt <= Date.now()
    ) {
      clearAuthState();
      return null;
    }

    return state;
  } catch (error) {
    console.error(
      "Failed to load auth state:",
      error,
    );

    clearAuthState();

    return null;
  }
}

export function clearAuthState(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(
      AUTH_STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "Failed to clear auth state:",
      error,
    );
  }
}
