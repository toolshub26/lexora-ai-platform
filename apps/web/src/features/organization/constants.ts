export const ORGANIZATION_COLLECTION = "organizations";

export const ORGANIZATION_SUBCOLLECTIONS = {
  MEMBERS: "members",
  TEAMS: "teams",
  INVITES: "invites",
  DOCUMENTS: "documents",
  MATTERS: "matters",
  CONTRACTS: "contracts",
  COMPLIANCE: "compliance",
  AI_SESSIONS: "aiSessions",
  NOTIFICATIONS: "notifications",
  AUDIT_LOGS: "auditLogs",
  REPORTS: "reports",
} as const;

export const DEFAULT_ORGANIZATION_STATUS = "active" as const;

export const DEFAULT_MEMBERSHIP_STATUS = "active" as const;

export const DEFAULT_ORGANIZATION_ROLE = "admin" as const;

export const ORGANIZATION_SLUG_MAX_LENGTH = 63;

export const ORGANIZATION_NAME_MAX_LENGTH = 120;

export const ORGANIZATION_INVITE_EXPIRY_DAYS = 7;
