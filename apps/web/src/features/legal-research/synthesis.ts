import type {
  LegalCitation,
  LegalEvidence,
  LegalSourceRecord,
  LegalSourceVerification,
} from "./sources";

export interface LegalSynthesisInput {
  query: string;
  sources: LegalSourceRecord[];
  evidence: LegalEvidence[];
  verifications: LegalSourceVerification[];
  citations: LegalCitation[];
}

export interface LegalSynthesisResult {
  summary: string;
  citationIds: string[];
}

export interface LegalSynthesisProvider {
  synthesize(
    input: LegalSynthesisInput,
  ): Promise<LegalSynthesisResult>;
}

export class EmptyLegalSynthesisProvider
  implements LegalSynthesisProvider
{
  async synthesize(
    _input: LegalSynthesisInput,
  ): Promise<LegalSynthesisResult> {
    return {
      summary: "Legal synthesis is not available.",
      citationIds: [],
    };
  }
}

export function validateLegalSynthesisCitations(
  citationIds: readonly string[],
  citations: readonly LegalCitation[],
): string[] {
  const verifiedCitationIds = new Set(
    citations
      .filter(
        (citation) =>
          citation.verificationStatus === "verified",
      )
      .map((citation) => citation.sourceId),
  );

  return citationIds.filter(
    (citationId) => !verifiedCitationIds.has(citationId),
  );
}
