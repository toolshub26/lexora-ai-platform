export type ComplianceStatus =
  | "active"
  | "expired"
  | "in_progress"
  | "completed";

export interface ComplianceItem {
  id: string;

  title: string;

  description?: string;

  status: ComplianceStatus;

  organizationId: string;

  assignedTo?: string;

  deadline?: Date;

  category?: string;

  createdAt: Date;

  updatedAt: Date;

  notes?: string;
}

export interface ComplianceSummary {
  id: string;

  title: string;

  status: ComplianceStatus;

  deadline?: Date;

  category?: string;
}