import { authService } from "./service";

import type {
  RegisterRequest,
  AuthResponse,
} from "./types";

export async function register(
  data: RegisterRequest,
): Promise<AuthResponse> {
  return authService.register(data);
}
