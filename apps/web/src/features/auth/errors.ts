/**
 * Lexora AI Platform
 * Authentication Error Definitions
 */

export class AuthError extends Error {
  constructor(message: string) {
    super(message);

    this.name = "AuthError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password.");

    this.name = "InvalidCredentialsError";
  }
}

export class UnauthorizedError extends AuthError {
  constructor() {
    super("Unauthorized.");

    this.name = "UnauthorizedError";
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super("Session expired. Please sign in again.");

    this.name = "SessionExpiredError";
  }
}

export class EmailNotVerifiedError extends AuthError {
  constructor() {
    super("Email address is not verified.");

    this.name = "EmailNotVerifiedError";
  }
}

export class PermissionDeniedError extends AuthError {
  constructor() {
    super("Permission denied.");

    this.name = "PermissionDeniedError";
  }
}

export class UserNotFoundError extends AuthError {
  constructor() {
    super("User not found.");

    this.name = "UserNotFoundError";
  }
}

export class UserDisabledError extends AuthError {
  constructor() {
    super("This account has been disabled.");

    this.name = "UserDisabledError";
  }
}

export class WeakPasswordError extends AuthError {
  constructor() {
    super("Password is too weak.");

    this.name = "WeakPasswordError";
  }
}

export class EmailAlreadyInUseError extends AuthError {
  constructor() {
    super("Email address is already registered.");

    this.name = "EmailAlreadyInUseError";
  }
}

export class TooManyRequestsError extends AuthError {
  constructor() {
    super("Too many login attempts. Please try again later.");

    this.name = "TooManyRequestsError";
  }
}
