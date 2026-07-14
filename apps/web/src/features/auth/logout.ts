import { signOut } from "firebase/auth";

import { auth } from "./firebase";
import { authSession } from "./session";

export async function logout(): Promise<void> {
  await signOut(auth);

  authSession.clearSession();
}
