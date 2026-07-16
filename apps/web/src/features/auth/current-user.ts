import { auth } from "./firebase";
import type { User } from "./types";

export function getCurrentUser(): User | null {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return null;
  }

  return {
    id: currentUser.uid,
    email: currentUser.email ?? "",
    name: currentUser.displayName ?? "",
    avatar: currentUser.photoURL ?? undefined,
    phone: currentUser.phoneNumber ?? undefined,
    role: "user",
    provider: "password",
    emailVerified: currentUser.emailVerified,
    disabled: false,
    lastLoginAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export function isLoggedIn(): boolean {
  return auth.currentUser !== null;
}

export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function isEmailVerified(): boolean {
  return auth.currentUser?.emailVerified ?? false;
}
