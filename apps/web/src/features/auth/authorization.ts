import {
  ROLE_PERMISSIONS,
  type Permission,
} from "./permissions";

import type { Role } from "./roles";

export interface AuthorizationContext {
  role: Role;
  permissions?: readonly Permission[];
}

function getPermissions(
  context: AuthorizationContext,
): readonly Permission[] {
  return context.permissions ??
    ROLE_PERMISSIONS[context.role];
}

export function hasPermission(
  context: AuthorizationContext,
  permission: Permission,
): boolean {
  return getPermissions(context).includes(permission);
}

export function hasAnyPermission(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  const currentPermissions =
    getPermissions(context);

  return permissions.some((permission) =>
    currentPermissions.includes(permission),
  );
}

export function hasAllPermissions(
  context: AuthorizationContext,
  permissions: readonly Permission[],
): boolean {
  const currentPermissions =
    getPermissions(context);

  return permissions.every((permission) =>
    currentPermissions.includes(permission),
  );
}
