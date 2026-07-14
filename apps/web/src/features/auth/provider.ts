import type { AuthState } from "./state";
import { authSession } from "./session";

export class AuthProvider {
  private state: AuthState | null = null;

  initialize(): AuthState | null {
    this.state = authSession.getSession();
    return this.state;
  }

  getState(): AuthState | null {
    return this.state;
  }

  setState(state: AuthState): void {
    this.state = state;
    authSession.saveSession(state);
  }

  clear(): void {
    this.state = null;
    authSession.clearSession();
  }
}

export const authProvider = new AuthProvider();
