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

