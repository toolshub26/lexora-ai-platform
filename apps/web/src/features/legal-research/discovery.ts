import type {
  LegalJurisdictionRef,
  LegalResearchQuery,
  LegalSourceType,
} from "./types";

export interface LegalSourceCandidate {
  id: string;
  title: string;
  sourceType: LegalSourceType;

  jurisdiction?: LegalJurisdictionRef;

  authorityId?: string;
  authorityName?: string;

  sourceUrl?: string;
  citation?: string;

  relevance?: number;
}

export interface LegalDocumentCandidate {
  id: string;
  sourceId: string;
  title: string;
  documentUrl: string;
  sourceType: LegalSourceType;

  jurisdiction?: LegalJurisdictionRef;

  authorityId?: string;
  authorityName?: string;

  citation?: string;
  publishedAt?: Date;

  relevance?: number;
}


export interface LegalDocumentDiscoveryRequest {
  query: LegalResearchQuery;
  sources: readonly LegalSourceCandidate[];
}

export interface LegalDocumentDiscoveryResult {
  documents: LegalDocumentCandidate[];
}

export interface LegalDocumentDiscoveryProvider {
  discover(
    request: LegalDocumentDiscoveryRequest,
  ): Promise<LegalDocumentDiscoveryResult>;
}

export interface LegalSourceDiscoveryRequest {
  query: LegalResearchQuery;
}

export interface LegalSourceDiscoveryResult {
  candidates: LegalSourceCandidate[];
}

export interface LegalSourceDiscoveryProvider {
  discover(
    request: LegalSourceDiscoveryRequest,
  ): Promise<LegalSourceDiscoveryResult>;
}

export class EmptyLegalSourceDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  async discover(
    _request: LegalSourceDiscoveryRequest,
  ): Promise<LegalSourceDiscoveryResult> {
    return {
      candidates: [],
    };
  }
}
