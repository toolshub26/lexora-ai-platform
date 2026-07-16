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

  private buildSession(user: FirebaseUser): Session {
    return {
      accessToken: "",
      refreshToken: user.refreshToken,
      expiresAt: Date.now() + 60 * 60 * 1000,
      user: this.mapUser(user),
    };
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );

      return {
        success: true,
        message: "Login successful.",
        session: this.buildSession(
          credential.user,
        ),
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
      const credential =
        await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password,
        );

      await updateProfile(
        credential.user,
        {
          displayName: data.name,
        },
      );

      await sendEmailVerification(
        credential.user,
      );

      return {
        success: true,
        message:
          "Registration successful. Verification email sent.",
        session: this.buildSession(
          credential.user,
        ),
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
  }

  async refreshSession(): Promise<AuthResponse> {
    return new Promise((resolve) => {
      const unsubscribe =
        onAuthStateChanged(
          auth,
          async (user) => {
            unsubscribe();

            if (!user) {
              resolve({
                success: false,
                message:
                  "No active session.",
              });
              return;
            }

            resolve({
              success: true,
              message:
                "Session refreshed.",
              session:
                this.buildSession(user),
            });
          },
        );
    });
  }
}

export const authService =
  new AuthService();
