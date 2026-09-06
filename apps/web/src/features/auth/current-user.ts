import {
  getAdditionalUserInfo,
  type User as FirebaseUser,
} from "firebase/auth";

import { auth } from "./firebase";
import type { User } from "./types";

function getProvider(user: FirebaseUser): User["provider"] {
  const additionalInfo = getAdditionalUserInfo({
    user,
    providerId: user.providerData[0]?.providerId ?? "",
  } as never);

  const providerId =
    additionalInfo?.providerId ??
    user.providerData[0]?.providerId ??
    "password";

  if (providerId === "google.com") return "google";
  if (providerId === "github.com") return "github";
  if (providerId === "microsoft.com") return "microsoft";

  return "password";
}

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
    provider: getProvider(currentUser),
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
