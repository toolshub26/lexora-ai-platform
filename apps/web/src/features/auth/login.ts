import { authService } from "./service";
import type {
  LoginRequest,
  AuthResponse,
} from "./types";

export async function login(
  data: LoginRequest,
): Promise<AuthResponse> {
  return authService.login(data);
}
