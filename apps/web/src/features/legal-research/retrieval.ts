import type {
  LegalDocumentCandidate,
  LegalSourceCandidate,
} from "./discovery";
import type {
  LegalResearchQuery,
  LegalResearchSource,
} from "./types";
import type {
  LegalCitation,
  LegalEvidence,
  LegalSourceRecord,
} from "./sources";

export interface LegalRetrievalRequest {
  query: LegalResearchQuery;
  candidates?: readonly (LegalSourceCandidate | LegalDocumentCandidate)[];
}

export interface LegalRetrievalResult {
  sources: LegalSourceRecord[];
  evidence: LegalEvidence[];
  researchSources: LegalResearchSource[];
  citations?: LegalCitation[];
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
