import type {
  LoginRequest,
  RegisterRequest,
} from "./types";

import {
  AuthError,
  InvalidCredentialsError,
} from "./errors";

import { isValidEmail } from "./utils";

export function validateLogin(
  data: LoginRequest,
): void {
  if (!data.email?.trim()) {
    throw new AuthError("Email is required.");
  }

  if (!isValidEmail(data.email)) {
    throw new InvalidCredentialsError();
  }

  if (!data.password?.trim()) {
    throw new AuthError("Password is required.");
  }

  if (data.password.length < 8) {
    throw new AuthError(
      "Password must contain at least 8 characters.",
    );
  }
}

export function validateRegister(
  data: RegisterRequest,
): void {
  if (!data.name?.trim()) {
    throw new AuthError("Name is required.");
  }

  if (data.name.trim().length < 2) {
    throw new AuthError(
      "Name must contain at least 2 characters.",
    );
  }

  validateLogin(data);

  if (data.password !== data.confirmPassword) {
    throw new AuthError(
      "Passwords do not match.",
    );
  }
}
