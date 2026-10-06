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
    provider: "google",
    emailVerified: firebaseUser.emailVerified,
    disabled: firebaseUser.disabled,
    lastLoginAt,
    createdAt,
    updatedAt: lastLoginAt,
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

    const user = mapGoogleUser(credential.user);

    const session: Session = {
      user,
    };

    authSession.saveSession({
      isAuthenticated: true,
      isLoading: false,
      userId: user.id,
      user,
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
