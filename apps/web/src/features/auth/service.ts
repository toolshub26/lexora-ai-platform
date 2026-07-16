import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

import { auth } from "./firebase";
import { authSession } from "./session";

import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  User,
  Session,
} from "./types";

export class AuthService {
  private mapUser(user: FirebaseUser): User {
    return {
      id: user.uid,
      email: user.email ?? "",
      name: user.displayName ?? "",
      avatar: user.photoURL ?? undefined,
      phone: user.phoneNumber ?? undefined,
      role: "user",
      provider: "password",
      emailVerified: user.emailVerified,
      disabled: false,
      lastLoginAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  private async buildSession(
    user: FirebaseUser,
  ): Promise<Session> {
    const accessToken =
      await user.getIdToken();

    return {
      accessToken,
      refreshToken: user.refreshToken,
      expiresAt:
        Date.now() + 60 * 60 * 1000,
      user: this.mapUser(user),
    };
  }

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

      if (!data.password.trim()) {
        return {
          success: false,
          message: "Password is required.",
        };
      }

      const credential =
        await signInWithEmailAndPassword(
          auth,
          data.email.trim(),
          data.password,
        );

      const session =
        await this.buildSession(
          credential.user,
        );

      authSession.saveSession({
        isAuthenticated: true,
        isLoading: false,
        accessToken:
          session.accessToken,
        refreshToken:
          session.refreshToken,
        expiresAt:
          session.expiresAt,
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

      if (!data.password.trim()) {
        return {
          success: false,
          message: "Password is required.",
        };
      }

      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          message: "Passwords do not match.",
        };
      }

      const credential =
        await createUserWithEmailAndPassword(
          auth,
          data.email.trim(),
          data.password,
        );

      await updateProfile(credential.user, {
        displayName: data.name.trim(),
      });

      await sendEmailVerification(
        credential.user,
      );

      const session =
        await this.buildSession(
          credential.user,
        );

      authSession.saveSession({
        isAuthenticated: true,
        isLoading: false,
        accessToken:
          session.accessToken,
        refreshToken:
          session.refreshToken,
        expiresAt:
          session.expiresAt,
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
    return new Promise((resolve) => {
      const unsubscribe =
        onAuthStateChanged(
          auth,
          async (user) => {
            unsubscribe();

            if (!user) {
              authSession.clearSession();

              resolve({
                success: false,
                message:
                  "No active session.",
              });

              return;
            }

            const session =
              await this.buildSession(
                user,
              );

            authSession.saveSession({
              isAuthenticated: true,
              isLoading: false,
              accessToken:
                session.accessToken,
              refreshToken:
                session.refreshToken,
              expiresAt:
                session.expiresAt,
              userId: session.user.id,
              user: session.user,
              error: null,
            });

            resolve({
              success: true,
              message:
                "Session refreshed.",
              session,
            });
          },
        );
    });
  }
}

export const authService =
  new AuthService();
