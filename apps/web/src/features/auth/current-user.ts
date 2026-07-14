import { auth } from "./firebase";
import type { User } from "firebase/auth";

export function getCurrentUser(): User | null {
  return auth.currentUser;
}

export function isLoggedIn(): boolean {
  return auth.currentUser !== null;
}
