import type {
  LegalCitation,
  LegalEvidence,
  LegalSourceRecord,
  LegalSourceVerification,
} from "./sources";

export interface LegalVerificationRequest {
  sources: LegalSourceRecord[];
  evidence: LegalEvidence[];
  citations: LegalCitation[];
}

export interface LegalVerificationResult {
  verifications: LegalSourceVerification[];
  citations: LegalCitation[];
}

export interface LegalSourceVerifier {
  verify(
    request: LegalVerificationRequest,
  ): Promise<LegalVerificationResult>;
}

export class EmptyLegalSourceVerifier
  implements LegalSourceVerifier
{
  async verify(
    request: LegalVerificationRequest,
  ): Promise<LegalVerificationResult> {
    return {
      verifications: request.sources.map((source) => ({
        sourceId: source.id,
        status: "unverified",
        authorityConfirmed: false,
        jurisdictionConfirmed: false,
      })),
      citations: request.citations.map((citation) => ({
        ...citation,
        verificationStatus: "unverified",
      })),
    };
  }
}
