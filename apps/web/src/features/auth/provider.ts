import type { Unsubscribe, User as FirebaseUser } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";
import { authSession } from "./session";
import type { AuthState } from "./state";
import type { User } from "./types";

function mapFirebaseUser(firebaseUser: FirebaseUser): User {
  const providerId =
    firebaseUser.providerData[0]?.providerId ?? "password";

  const provider =
    providerId === "google.com"
      ? "google"
      : providerId === "github.com"
        ? "github"
        : providerId === "microsoft.com"
          ? "microsoft"
          : "password";

  const createdAt =
    firebaseUser.metadata.creationTime ??
    new Date().toISOString();

  const lastLoginAt =
    firebaseUser.metadata.lastSignInTime ??
    createdAt;

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    name: firebaseUser.displayName ?? "",
    avatar: firebaseUser.photoURL ?? undefined,
    phone: firebaseUser.phoneNumber ?? undefined,
    role: "user",
    provider,
    emailVerified: firebaseUser.emailVerified,
    disabled: firebaseUser.disabled,
    lastLoginAt,
    createdAt,
    updatedAt: lastLoginAt,
  };
}

function createAuthState(
  firebaseUser: FirebaseUser | null,
): AuthState {
  if (!firebaseUser) {
    return {
      isAuthenticated: false,
      isLoading: false,
      userId: null,
      user: null,
      error: null,
    };
  }

  const user = mapFirebaseUser(firebaseUser);

  return {
    isAuthenticated: true,
    isLoading: false,
    userId: user.id,
    user,
    error: null,
  };
}

export class AuthProvider {
  private state: AuthState = {
    isAuthenticated: false,
    isLoading: true,
    userId: null,
    user: null,
    error: null,
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
      ...this.state,
      isLoading: true,
      error: null,
    };

    this.notify();

    this.unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser) => {
        this.state = createAuthState(firebaseUser);

        authSession.saveSession(this.state);

        this.notify();
      },
      (error) => {
        this.state = {
          isAuthenticated: false,
          isLoading: false,
          userId: null,
          user: null,
          error: error.message,
        };

        authSession.clearSession();

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

    authSession.saveSession(this.state);

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
    this.listeners.forEach((listener) => {
      listener(this.state);
    });
  }
}

export const authProvider = new AuthProvider();
