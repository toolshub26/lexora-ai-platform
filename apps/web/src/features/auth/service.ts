import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "./firebase";
import { authSession } from "./session";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  Session,
  User,
} from "./types";

function mapFirebaseUser(
  firebaseUser: FirebaseUser,
): User {
  const createdAt =
    firebaseUser.metadata.creationTime ??
    new Date().toISOString();

  const lastLoginAt =
    firebaseUser.metadata.lastSignInTime ??
    createdAt;

  const providerId =
    firebaseUser.providerData[0]?.providerId ??
    "password";

  const provider =
    providerId === "google.com"
      ? "google"
      : providerId === "github.com"
        ? "github"
        : providerId === "microsoft.com"
          ? "microsoft"
          : "password";

  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    name: firebaseUser.displayName ?? "",
    avatar: firebaseUser.photoURL ?? undefined,
    phone: firebaseUser.phoneNumber ?? undefined,
    role: "user",
    provider,
    emailVerified: firebaseUser.emailVerified,
    disabled: false,
    lastLoginAt,
    createdAt,
    updatedAt: lastLoginAt,
  };
}

function buildSession(
  firebaseUser: FirebaseUser,
): Session {
  return {
    user: mapFirebaseUser(firebaseUser),
  };
}

export class AuthService {
  async login(
    data: LoginRequest,
  ): Promise<AuthResponse> {
    try {
      if (!data.email.trim()) {
        return {
          success: false,
          message: "Email is required.",
        };
      }

      if (!data.password) {
        return {
          success: false,
          message: "Password is required.",
        };
      }

      const credential =
        await signInWithEmailAndPassword(
          auth,
          data.email.trim().toLowerCase(),
          data.password,
        );

      const session = buildSession(
        credential.user,
      );

      authSession.saveSession({
        isAuthenticated: true,
        isLoading: false,
        userId: session.user.id,
        user: session.user,
        error: null,
      });

      return {
        success: true,
        message: "Login successful.",
        session,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Login failed.",
      };
    }
  }

  async register(
    data: RegisterRequest,
  ): Promise<AuthResponse> {
    try {
      if (!data.name.trim()) {
        return {
          success: false,
          message: "Name is required.",
        };
      }

      if (!data.email.trim()) {
        return {
          success: false,
          message: "Email is required.",
        };
      }

      if (!data.password) {
        return {
          success: false,
          message: "Password is required.",
        };
      }

      if (data.password.length < 8) {
        return {
          success: false,
          message:
            "Password must be at least 8 characters.",
        };
      }

      if (
        data.password !==
        data.confirmPassword
      ) {
        return {
          success: false,
          message: "Passwords do not match.",
        };
      }

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          data.email.trim().toLowerCase(),
          data.password,
        );

      await updateProfile(
        credential.user,
        {
          displayName: data.name.trim(),
        },
      );

      await sendEmailVerification(
        credential.user,
      );

      const session = buildSession(
        credential.user,
      );

      authSession.saveSession({
        isAuthenticated: true,
        isLoading: false,
        userId: session.user.id,
        user: session.user,
        error: null,
      });

      return {
        success: true,
        message:
          "Registration successful. Verification email sent.",
        session,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Registration failed.",
      };
    }
  }

  async logout(): Promise<void> {
    await signOut(auth);
    authSession.clearSession();
  }

  async refreshSession(): Promise<AuthResponse> {
    const firebaseUser = auth.currentUser;

    if (!firebaseUser) {
      authSession.clearSession();

      return {
        success: false,
        message: "No active session.",
      };
    }

    const session =
      buildSession(firebaseUser);

    authSession.saveSession({
      isAuthenticated: true,
      isLoading: false,
      userId: session.user.id,
      user: session.user,
      error: null,
    });

    return {
      success: true,
      message: "Session refreshed.",
      session,
    };
  }
}

export const authService =
  new AuthService();
