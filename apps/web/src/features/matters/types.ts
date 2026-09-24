export type MatterStatus =
  | "open"
  | "pending"
  | "issue"
  | "resolved"
  | "closed";

export interface Matter {
  id: string;

  title: string;

  description?: string;

  status: MatterStatus;

  organizationId: string;

  creatorId: string;

  createdAt: Date;

  updatedAt: Date;

  associatedDocumentIds: string[];

  clientName?: string;

  opposingParty?: string;

  caseNumber?: string;

  courtJurisdiction?: string;

  dateFiled?: Date;

  courtDate?: Date;
}

export interface MatterSummary {
  id: string;

  title: string;

  status: MatterStatus;

  organizationId: string;

  caseNumber?: string;

  clientName?: string;

  createdAt: Date;
}