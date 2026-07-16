import type { Permission } from "./permissions";
import type { Role } from "./roles";

import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from "./authorization";

export interface AuthGuardContext {
  isAuthenticated: boolean;
  role: Role;
  permissions?: readonly Permission[];
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
  return (
    context.isAuthenticated &&
    context.role === role
  );
}

export function requirePermission(
  context: AuthGuardContext,
  permission: Permission,
): boolean {
  return (
    context.isAuthenticated &&
    hasPermission(context, permission)
  );
}

export function requireAnyPermission(
  context: AuthGuardContext,
  permissions: readonly Permission[],
): boolean {
  return (
    context.isAuthenticated &&
    hasAnyPermission(context, permissions)
  );
}

export function requireAllPermissions(
  context: AuthGuardContext,
  permissions: readonly Permission[],
): boolean {
  return (
    context.isAuthenticated &&
    hasAllPermissions(context, permissions)
  );
}
