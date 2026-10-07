import {
  onAuthStateChanged,
  type Unsubscribe,
} from "firebase/auth";

import { auth } from "./firebase";
import { getCurrentUser } from "./current-user";
import { authSession } from "./session";
import {
  initialAuthState,
  type AuthState,
} from "./state";

export class AuthProvider {
  private state: AuthState = {
    ...initialAuthState,
  };

  private listeners = new Set<
    (state: AuthState) => void
  >();

  private unsubscribe: Unsubscribe | null = null;

  initialize(): void {
    if (this.unsubscribe) {
      return;
    }

    this.state = {
      ...initialAuthState,
    };

    this.notify();

    this.unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          if (!firebaseUser) {
            this.state = {
              isAuthenticated: false,
              isLoading: false,
              userId: null,
              user: null,
              error: null,
            };

            authSession.clearSession();
            this.notify();

            return;
          }

          const user =
            getCurrentUser();

          if (!user) {
            this.state = {
              isAuthenticated: false,
              isLoading: false,
              userId: null,
              user: null,
              error: "Unable to load user.",
            };

            authSession.clearSession();
            this.notify();

            return;
          }

          this.state = {
            isAuthenticated: true,
            isLoading: false,
            userId: user.id,
            user,
            error: null,
          };

          authSession.saveSession(
            this.state,
          );

          this.notify();
        },
      );
  }

  destroy(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.listeners.clear();
  }

  getState(): AuthState {
    return this.state;
  }

  setState(state: AuthState): void {
    this.state = {
      ...state,
    };

    authSession.saveSession(
      this.state,
    );

    this.notify();
  }

  clear(): void {
    this.state = {
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      user: null,
      error: null,
    };

    authSession.clearSession();
    this.notify();
  }

  subscribe(
    listener: (state: AuthState) => void,
  ): () => void {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach(
      (listener) => listener(this.state),
    );
  }
}

export const authProvider =
  new AuthProvider();
