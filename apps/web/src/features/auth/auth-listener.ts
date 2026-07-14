import { onAuthStateChanged } from "firebase/auth";

import { auth } from "./firebase";

export function subscribeToAuthChanges(
  callback: ReturnType<typeof onAuthStateChanged> extends () => void
    ? (user: typeof auth.currentUser) => void
    : never,
) {
  return onAuthStateChanged(auth, callback);
}
