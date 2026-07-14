import { sendPasswordResetEmail } from "firebase/auth";

import { auth } from "./firebase";

export async function forgotPassword(
  email: string
): Promise<void> {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    throw new Error("Email is required.");
  }

  await sendPasswordResetEmail(auth, normalizedEmail);
}
