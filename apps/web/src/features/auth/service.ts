import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
} from "./types";

export class AuthService {
  async login(_data: LoginRequest): Promise<AuthResponse> {
    throw new Error("Login not implemented.");
  }

  async register(_data: RegisterRequest): Promise<AuthResponse> {
    throw new Error("Register not implemented.");
  }

  async logout(): Promise<void> {
    throw new Error("Logout not implemented.");
  }

  async refreshSession(): Promise<AuthResponse> {
    throw new Error("Session refresh not implemented.");
  }
}

export const authService = new AuthService();
