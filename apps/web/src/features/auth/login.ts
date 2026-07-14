import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "./firebase";
import type { LoginRequest } from "./types";

export async function login(data: LoginRequest) {
  return signInWithEmailAndPassword(
    auth,
    data.email,
    data.password
  );
}
