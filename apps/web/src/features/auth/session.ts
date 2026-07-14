import type { AuthState } from "./state";
import {
  loadAuthState,
  saveAuthState,
  clearAuthState,
} from "./storage";

export class AuthSessionManager {
  getSession(): AuthState | null {
    return loadAuthState();
  }

  saveSession(state: AuthState): void {
    saveAuthState(state);
  }

  clearSession(): void {
    clearAuthState();
  }

  isAuthenticated(): boolean {
    const session = this.getSession();
    return session?.isAuthenticated ?? false;
  }
}

export const authSession = new AuthSessionManager();
