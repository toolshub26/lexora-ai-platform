# Lexora Organization & Membership Domain v2.0.0

## Purpose

Provides the enterprise tenant boundary between Firebase Authentication
identity and organization-owned business data.

## Identity model

Firebase Authentication
→ User Identity
→ Organization Membership
→ Role / Permissions
→ Organization-scoped resources

## Security principles

- Firebase Authentication establishes identity.
- Organization membership establishes tenant access.
- Role and permissions are authorization data.
- Client-supplied organizationId, role, or permissions are never trusted
  as an authorization decision.
- Server-side authorization must validate organization membership.
- Organization-owned resources must remain under the organization boundary.
- Important membership and organization changes require audit evidence.

## Canonical organization hierarchy

organizations/{organizationId}
├── members/{userId}
├── teams/{teamId}
├── invites/{inviteId}
├── documents/{documentId}
├── matters/{matterId}
├── contracts/{contractId}
├── compliance/{itemId}
├── aiSessions/{sessionId}
├── notifications/{notificationId}
├── auditLogs/{auditId}
└── reports/{reportId}

## Version

2.0.0
