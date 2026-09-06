import { sendEmailVerification } from "firebase/auth";

import { auth } from "./firebase";

export async function verifyEmail(): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found.");
  }

  if (user.emailVerified) {
    return;
  }

  await sendEmailVerification(user);
}

export async function refreshEmailVerificationStatus(): Promise<boolean> {
  const user = auth.currentUser;

  if (!user) {
    return false;
  }

  await user.reload();

  return user.emailVerified;
}
