export type TeamRole =
  | "owner"
  | "admin"
  | "member";

export type TeamStatus = "active" | "archived";

export interface Team {
  id: string;

  name: string;

  description?: string;

  role: TeamRole;

  status: TeamStatus;

  organizationId: string;

  creatorId: string;

  memberCount: number;

  createdAt: Date;

  updatedAt: Date;

  permissions: readonly string[];
}

export interface TeamMember {
  userId: string;

  organizationId: string;

  teamId: string;

  role: TeamRole;

  status: TeamStatus;

  joinedAt: Date;

  invitedBy?: string;
}

export interface TeamSummary {
  id: string;

  name: string;

  role: TeamRole;

  memberCount: number;

  status: TeamStatus;
}