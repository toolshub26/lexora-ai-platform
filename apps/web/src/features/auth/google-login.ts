import {
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

import { auth } from "./firebase";
import { authSession } from "./session";
import type {
  AuthResponse,
  Session,
  User,
} from "./types";

function mapGoogleUser(
  firebaseUser: import("firebase/auth").User,
): User {
  return {
    id: firebaseUser.uid,
    email: firebaseUser.email ?? "",
    name: firebaseUser.displayName ?? "",
    avatar: firebaseUser.photoURL ?? undefined,
    phone: firebaseUser.phoneNumber ?? undefined,
    role: "user",
    provider: "google",
    emailVerified: firebaseUser.emailVerified,
    disabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function loginWithGoogle(): Promise<AuthResponse> {
  try {
    const provider = new GoogleAuthProvider();

    provider.setCustomParameters({
      prompt: "select_account",
    });

    const credential = await signInWithPopup(
      auth,
      provider,
    );

    const firebaseUser = credential.user;

    const accessToken = await firebaseUser.getIdToken();

    const session: Session = {
      accessToken,
      refreshToken: firebaseUser.refreshToken,
      expiresAt: Date.now() + 60 * 60 * 1000,
      user: mapGoogleUser(firebaseUser),
    };

    authSession.saveSession({
      isAuthenticated: true,
      isLoading: false,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken,
      expiresAt: session.expiresAt,
      userId: session.user.id,
      user: session.user,
      error: null,
    });

    return {
      success: true,
      message: "Google login successful.",
      session,
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Google login failed.",
    };
  }
}
