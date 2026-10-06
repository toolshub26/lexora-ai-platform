import type { User } from "firebase/auth";
import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

export function subscribeToAuthChanges(
  callback: (user: User | null) => void,
) {
  return onAuthStateChanged(auth, callback);
}
