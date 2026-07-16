import type { AuthState } from "./state";
import {
  loadAuthState,
  saveAuthState,
  clearAuthState,
} from "./storage";

export class AuthSessionManager {
  getSession(): AuthState | null {
    const session = loadAuthState();

    if (!session) {
      return null;
    }

    if (
      session.expiresAt &&
      session.expiresAt <= Date.now()
    ) {
      this.clearSession();
      return null;
    }

    return session;
  }

  saveSession(state: AuthState): void {
    saveAuthState(state);
  }

  clearSession(): void {
    clearAuthState();
  }

  isAuthenticated(): boolean {
    const session = this.getSession();

    return (
      session?.isAuthenticated === true &&
      !!session.accessToken
    );
  }

  hasValidSession(): boolean {
    return this.getSession() !== null;
  }
}

export const authSession =
  new AuthSessionManager();
