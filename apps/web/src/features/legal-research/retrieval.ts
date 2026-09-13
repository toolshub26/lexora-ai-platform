import type {
  LegalResearchQuery,
  LegalResearchSource,
} from "./types";
import type {
  LegalEvidence,
  LegalSourceRecord,
} from "./sources";

export interface LegalRetrievalRequest {
  query: LegalResearchQuery;
}

export interface LegalRetrievalResult {
  sources: LegalSourceRecord[];
  evidence: LegalEvidence[];
  researchSources: LegalResearchSource[];
}

export interface LegalSourceRetriever {
  retrieve(
    request: LegalRetrievalRequest,
  ): Promise<LegalRetrievalResult>;
}

export class EmptyLegalSourceRetriever
  implements LegalSourceRetriever
{
  async retrieve(
    _request: LegalRetrievalRequest,
  ): Promise<LegalRetrievalResult> {
    return {
      sources: [],
      evidence: [],
      researchSources: [],
    };
  }
}
