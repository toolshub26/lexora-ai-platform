import type { Permission } from "./permissions";
import type { Role } from "./roles";
import { hasPermission } from "./authorization";

export interface AuthGuardContext {
  isAuthenticated: boolean;
  role: Role;
  permissions: readonly Permission[];
}

export function requireAuth(
  context: AuthGuardContext,
): boolean {
  return context.isAuthenticated;
}

export function requireRole(
  context: AuthGuardContext,
  role: Role,
): boolean {
  return context.role === role;
}

export function requirePermission(
  context: AuthGuardContext,
  permission: Permission,
): boolean {
  return hasPermission(context, permission);
}
