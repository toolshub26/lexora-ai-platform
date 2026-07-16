export const ROLES = {
  SUPER_ADMIN: "super-admin",
  ADMIN: "admin",
  MANAGER: "manager",
  EDITOR: "editor",
  USER: "user",
} as const;

export type Role =
  (typeof ROLES)[keyof typeof ROLES];
