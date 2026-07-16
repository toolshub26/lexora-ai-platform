import type { AuthState } from "./state";
import { authSession } from "./session";
import { onAuthStateChanged, type Unsubscribe } from "firebase/auth";
import { auth } from "./firebase";

export class AuthProvider {
  private state: AuthState | null = null;

  private listeners = new Set<
    (state: AuthState | null) => void
  >();

  private unsubscribe: Unsubscribe | null = null;

  initialize(): void {
    if (this.unsubscribe) {
      return;
    }

    this.state = authSession.getSession();

    this.unsubscribe = onAuthStateChanged(
      auth,
      () => {
        this.state = authSession.getSession();
        this.notify();
      },
    );
  }

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.listeners.clear();
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

    listener(this.state);

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
