import type { Role } from "./roles";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",
  PROFILE_VIEW: "profile:view",
  PROFILE_UPDATE: "profile:update",

  AI_CHAT: "ai:chat",
  AI_GENERATE: "ai:generate",

  DOCUMENT_CREATE: "document:create",
  DOCUMENT_READ: "document:read",
  DOCUMENT_UPDATE: "document:update",
  DOCUMENT_DELETE: "document:delete",

  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",

  BILLING_VIEW: "billing:view",
  BILLING_MANAGE: "billing:manage",

  SETTINGS_MANAGE: "settings:manage",
} as const;

export type Permission =
  (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type RolePermissions = Record<
  Role,
  readonly Permission[]
>;
