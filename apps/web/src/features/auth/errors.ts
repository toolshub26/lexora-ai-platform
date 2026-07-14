export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Invalid email or password.");
  }
}

export class UnauthorizedError extends AuthError {
  constructor() {
    super("Unauthorized.");
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super("Session expired.");
  }
}
