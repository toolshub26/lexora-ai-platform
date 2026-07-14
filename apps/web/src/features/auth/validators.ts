import type { LoginRequest, RegisterRequest } from "./types";
import { AuthError } from "./errors";

export function validateLogin(data: LoginRequest): void {
  if (!data.email?.trim()) {
    throw new AuthError("Email is required.");
  }

  if (!data.password?.trim()) {
    throw new AuthError("Password is required.");
  }
}

export function validateRegister(data: RegisterRequest): void {
  if (!data.name?.trim()) {
    throw new AuthError("Name is required.");
  }

  validateLogin(data);

  if (data.password.length < 8) {
    throw new AuthError(
      "Password must contain at least 8 characters."
    );
  }
}
