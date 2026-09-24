export type ContractStatus =
  | "draft"
  | "review"
  | "executed"
  | "expired"
  | "terminated";

export interface Contract {
  id: string;

  title: string;

  description?: string;

  status: ContractStatus;

  organizationId: string;

  creatorId: string;

  createdAt: Date;

  updatedAt: Date;

  counterpartyName?: string;

  contractType?: string;

  effectiveDate?: Date;

  expiryDate?: Date;

  valueAmount?: number;

  currency?: string;

  termsSummary?: string;

  autoRenewal?: boolean;
}

export interface ContractSummary {
  id: string;

  title: string;

  status: ContractStatus;

  counterpartyName?: string;

  createdAt: Date;
}