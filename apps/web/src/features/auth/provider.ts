import type { AuthState } from "./state";
import { authSession } from "./session";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

export class AuthProvider {
  private state: AuthState | null = null;

  private listeners = new Set<
    (state: AuthState | null) => void
  >();

  initialize(): void {
    this.state = authSession.getSession();

    onAuthStateChanged(auth, () => {
      this.state = authSession.getSession();
      this.notify();
    });
  }

  getState(): AuthState | null {
    return this.state;
  }

  setState(state: AuthState): void {
    this.state = state;

    authSession.saveSession(state);

    this.notify();
  }

  clear(): void {
    this.state = null;

    authSession.clearSession();

    this.notify();
  }

  subscribe(
    listener: (state: AuthState | null) => void,
  ): () => void {
    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) =>
      listener(this.state),
    );
  }
}

export const authProvider =
  new AuthProvider();
