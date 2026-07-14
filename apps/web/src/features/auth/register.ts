import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";

import { auth } from "./firebase";
import type { RegisterRequest } from "./types";

export async function register(data: RegisterRequest) {
  const credential =
    await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

  await updateProfile(credential.user, {
    displayName: data.name,
  });

  return credential;
}
