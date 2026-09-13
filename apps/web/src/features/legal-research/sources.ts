import type {
  LegalJurisdictionRef,
  LegalSourceType,
  LegalVerificationStatus,
} from "./types";

export type LegalSourceAuthorityLevel =
  | "primary"
  | "secondary";

export type LegalSourceAvailability =
  | "available"
  | "unavailable"
  | "restricted";

export type LegalEvidenceKind =
  | "full-text"
  | "excerpt"
  | "metadata"
  | "official-record";

export interface LegalSourceRecord {
  id: string;
  title: string;
  citation: string;
  sourceType: LegalSourceType;
  authorityLevel: LegalSourceAuthorityLevel;

  jurisdiction?: LegalJurisdictionRef;

  authorityId?: string;
  authorityName?: string;

  sourceUrl?: string;
  canonicalUrl?: string;

  publishedAt?: Date;
  effectiveFrom?: Date;
  effectiveTo?: Date;

  availability: LegalSourceAvailability;
  retrievedAt: Date;
}

export interface LegalEvidence {
  id: string;
  sourceId: string;
  kind: LegalEvidenceKind;

  excerpt: string;

  locator?: string;
  page?: number;
  paragraph?: number;
  section?: string;

  retrievedAt: Date;
}

export interface LegalSourceVerification {
  sourceId: string;
  status: LegalVerificationStatus;

  verifiedAt?: Date;

  verifiedUrl?: string;
  verifiedTitle?: string;

  authorityConfirmed: boolean;
  jurisdictionConfirmed: boolean;

  notes?: string;
}

export interface LegalCitation {
  sourceId: string;
  evidenceId?: string;

  citation: string;
  locator?: string;

  verificationStatus: LegalVerificationStatus;
}

export interface LegalResearchEvidenceSet {
  sources: LegalSourceRecord[];
  evidence: LegalEvidence[];
  verifications: LegalSourceVerification[];
  citations: LegalCitation[];
}

export interface LegalSourceRegistry {
  getById(id: string): LegalSourceRecord | undefined;

  getByJurisdiction(
    jurisdiction: LegalJurisdictionRef,
  ): LegalSourceRecord[];

  getByType(sourceType: LegalSourceType): LegalSourceRecord[];

  getByAuthority(authorityId: string): LegalSourceRecord[];
}

export class InMemoryLegalSourceRegistry
  implements LegalSourceRegistry
{
  private readonly sources: readonly LegalSourceRecord[];

  constructor(sources: readonly LegalSourceRecord[] = []) {
    this.sources = sources;
  }

  getById(id: string): LegalSourceRecord | undefined {
    return this.sources.find((source) => source.id === id);
  }

  getByJurisdiction(
    jurisdiction: LegalJurisdictionRef,
  ): LegalSourceRecord[] {
    return this.sources.filter((source) => {
      if (!source.jurisdiction) {
        return false;
      }

      if (
        jurisdiction.jurisdictionId &&
        source.jurisdiction.jurisdictionId !==
          jurisdiction.jurisdictionId
      ) {
        return false;
      }

      if (
        jurisdiction.countryCode &&
        source.jurisdiction.countryCode?.toUpperCase() !==
          jurisdiction.countryCode.trim().toUpperCase()
      ) {
        return false;
      }

      return true;
    });
  }

  getByType(sourceType: LegalSourceType): LegalSourceRecord[] {
    return this.sources.filter(
      (source) => source.sourceType === sourceType,
    );
  }

  getByAuthority(authorityId: string): LegalSourceRecord[] {
    return this.sources.filter(
      (source) => source.authorityId === authorityId,
    );
  }
}

export const legalSourceRegistry =
  new InMemoryLegalSourceRegistry();
