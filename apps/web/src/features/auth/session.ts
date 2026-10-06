import type { AuthState } from "./state";
import { initialAuthState } from "./state";

export class AuthSessionManager {
  private state: AuthState = {
    ...initialAuthState,
  };

  getSession(): AuthState {
    return this.state;
  }

  saveSession(state: AuthState): void {
    this.state = {
      ...state,
    };
  }

  clearSession(): void {
    this.state = {
      ...initialAuthState,
      isLoading: false,
    };
  }

  isAuthenticated(): boolean {
    return this.state.isAuthenticated;
  }

  hasValidSession(): boolean {
    return (
      this.state.isAuthenticated &&
      this.state.user !== null
    );
  }
}

export const authSession =
  new AuthSessionManager();
