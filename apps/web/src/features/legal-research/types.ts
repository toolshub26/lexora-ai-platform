export type LegalSourceType =
  | "cases"
  | "statutes"
  | "regulations"
  | "rules"
  | "official-publications"
  | "administrative-decisions"
  | "treaties"
  | "official-guidance"
  | "secondary";

export type LegalVerificationStatus =
  | "verified"
  | "unverified"
  | "failed";

export interface LegalJurisdictionRef {
  countryCode?: string;
  jurisdictionId?: string;
  authorityId?: string;
}

export interface LegalResearchQuery {
  query: string;
  jurisdiction?: LegalJurisdictionRef;
  practiceArea?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
  sources: LegalSourceType[];
}

export interface LegalResearchSource {
  id: string;
  title: string;
  citation: string;
  sourceType: LegalSourceType;
  jurisdictionId?: string;
  authorityId?: string;
  authorityName?: string;
  sourceUrl?: string;
  snippet: string;
  relevance: number;
  verificationStatus: LegalVerificationStatus;
  publishedAt?: Date;
  retrievedAt: Date;
}

export interface LegalResearchResult {
  query: string;
  sources: LegalResearchSource[];
  totalResults: number;
  executionTimeMs: number;
  completedAt: Date;
  summary?: string;
  citations?: import("./sources").LegalCitation[];
}

export type LegalResearchStatus =
  | "queued"
  | "resolving"
  | "retrieving"
  | "verifying"
  | "synthesizing"
  | "completed"
  | "failed";

export interface LegalResearchSession {
  id: string;
  userId: string;
  organizationId: string;
  query: LegalResearchQuery;
  status: LegalResearchStatus;
  results?: LegalResearchResult;
  createdAt: Date;
  updatedAt: Date;
}
