import { authService } from "./service";

export async function logout(): Promise<void> {
  await authService.logout();
}
