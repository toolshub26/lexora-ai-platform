import type { Permission } from "../auth/permissions";
import type { Role } from "../auth/roles";

export type OrganizationStatus =
  | "active"
  | "suspended"
  | "archived";

export type MembershipStatus =
  | "invited"
  | "active"
  | "suspended"
  | "removed";

export interface Organization {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationMembership {
  userId: string;
  organizationId: string;
  role: Role;
  permissions: readonly Permission[];
  status: MembershipStatus;
  invitedAt?: string;
  joinedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrganizationInvite {
  id: string;
  organizationId: string;
  email: string;
  role: Role;
  invitedBy: string;
  status: "pending" | "accepted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
}

export interface OrganizationSummary {
  id: string;
  name: string;
  slug: string;
  status: OrganizationStatus;
  role: Role;
}

export interface OrganizationContext {
  organization: Organization;
  membership: OrganizationMembership;
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
}

export interface CreateOrganizationInviteRequest {
  organizationId: string;
  email: string;
  role: Role;
}

export interface ActiveOrganizationState {
  organizationId: string | null;
}
