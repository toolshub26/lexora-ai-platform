export type UserRole =
  | "user"
  | "editor"
  | "manager"
  | "admin"
  | "super-admin";

export type AuthProvider =
  | "password"
  | "google"
  | "github"
  | "microsoft";

export interface User {
  id: string;

  email: string;

  name: string;

  avatar?: string;

  phone?: string;

  role: UserRole;

  provider: AuthProvider;

  emailVerified: boolean;

  disabled: boolean;

  lastLoginAt?: string;

  createdAt: string;

  updatedAt: string;
}

export interface Session {
  accessToken: string;

  refreshToken: string;

  expiresAt: number;

  user: User;
}

export interface LoginRequest {
  email: string;

  password: string;

  rememberMe?: boolean;
}

export interface RegisterRequest {
  name: string;

  email: string;

  password: string;

  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;

  message: string;

  session?: Session;

  errorCode?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface VerifyEmailRequest {
  token: string;
}
