import { AUTH_STORAGE_KEY } from "./constants";
import type { AuthState } from "./state";

export function saveAuthState(
  _state: AuthState,
): void {
  void _state;
}

export function loadAuthState(): AuthState | null {
  return null;
}

export function clearAuthState(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(
      AUTH_STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "Failed to clear legacy authentication state:",
      error,
    );
  }
}
