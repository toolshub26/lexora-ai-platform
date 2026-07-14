import type { Permission } from "./permissions";
import type { Role } from "./roles";

export interface AuthorizationContext {
  role: Role;
  permissions: readonly Permission[];
}

export function hasPermission(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  return context.permissions.includes(permission);
}

export function hasAnyPermission(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) =>
    context.permissions.includes(permission),
  );
}

export function hasAllPermissions(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) =>
    context.permissions.includes(permission),
  );
}
