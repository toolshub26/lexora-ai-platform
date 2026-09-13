import { describe, expect, it } from "vitest";
import { DefaultLegalResearchOrchestrator } from "../features/legal-research/orchestrator";
import type {
  LegalEvidence,
  LegalSourceRecord,
} from "../features/legal-research/sources";
import type {
  LegalRetrievalResult,
  LegalSourceRetriever,
} from "../features/legal-research/retrieval";
import type {
  LegalSourceVerifier,
  LegalVerificationResult,
} from "../features/legal-research/verification";

class ClaimingRetriever implements LegalSourceRetriever {
  async retrieve(): Promise<LegalRetrievalResult> {
    const retrievedAt = new Date();

    const source: LegalSourceRecord = {
      id: "source-integrity-1",
      title: "Example Source",
      citation: "Example Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "india",
      },
      availability: "available",
      retrievedAt,
    };

    const evidence: LegalEvidence = {
      id: "evidence-integrity-1",
      sourceId: source.id,
      kind: "excerpt",
      excerpt: "Example evidence.",
      retrievedAt,
    };

    return {
      sources: [source],
      evidence: [evidence],
      researchSources: [
        {
          id: source.id,
          title: source.title,
          citation: source.citation,
          sourceType: source.sourceType,
          jurisdictionId: "india",
          snippet: evidence.excerpt,
          relevance: 1,
          verificationStatus: "verified",
          retrievedAt,
        },
      ],
    };
  }
}

class RejectingVerifier implements LegalSourceVerifier {
  async verify(): Promise<LegalVerificationResult> {
    return {
      verifications: [
        {
          sourceId: "source-integrity-1",
          status: "unverified",
          authorityConfirmed: false,
          jurisdictionConfirmed: false,
          notes: "Verification did not establish authority.",
        },
      ],
      citations: [],
    };
  }
}

describe("LegalResearchOrchestrator verification integrity", () => {
  it("does not trust a retriever's verified status over verifier output", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      retriever: new ClaimingRetriever(),
      verifier: new RejectingVerifier(),
    });

    const result = await orchestrator.execute({
      query: {
        query: "Test verification integrity",
        sources: ["cases"],
      },
    });

    expect(result.verification.verifications[0].status).toBe(
      "unverified",
    );

    expect(result.research.sources[0].verificationStatus).toBe(
      "unverified",
    );
  });
});
