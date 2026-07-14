import { sendEmailVerification } from "firebase/auth";

import { auth } from "./firebase";

export async function verifyEmail(): Promise<void> {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("No authenticated user found.");
  }

  await sendEmailVerification(user);
}
