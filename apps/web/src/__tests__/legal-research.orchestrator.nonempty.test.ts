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

class FakeLegalSourceRetriever implements LegalSourceRetriever {
  async retrieve(): Promise<LegalRetrievalResult> {
    const source: LegalSourceRecord = {
      id: "source-1",
      title: "Example Primary Source",
      citation: "Example Citation 2026",
      sourceType: "cases",
      authorityLevel: "primary",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "india",
        authorityId: "supreme-court-india",
      },
      authorityId: "supreme-court-india",
      availability: "available",
      retrievedAt: new Date(),
    };

    const evidence: LegalEvidence = {
      id: "evidence-1",
      sourceId: source.id,
      kind: "excerpt",
      excerpt: "Example verified-test evidence.",
      locator: "paragraph 1",
      retrievedAt: new Date(),
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
          authorityId: source.authorityId,
          authorityName: "Supreme Court of India",
          snippet: evidence.excerpt,
          relevance: 1,
          verificationStatus: "unverified",
          retrievedAt: source.retrievedAt,
        },
      ],
    };
  }
}

class FakeLegalSourceVerifier implements LegalSourceVerifier {
  async verify(): Promise<LegalVerificationResult> {
    return {
      verifications: [
        {
          sourceId: "source-1",
          status: "unverified",
          authorityConfirmed: false,
          jurisdictionConfirmed: false,
          notes: "Test verifier does not establish authority.",
        },
      ],
      citations: [],
    };
  }
}

describe("DefaultLegalResearchOrchestrator non-empty verification flow", () => {
  it("passes retrieved sources and evidence through verification", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      retriever: new FakeLegalSourceRetriever(),
      verifier: new FakeLegalSourceVerifier(),
    });

    const result = await orchestrator.execute({
      query: {
        query: "Test primary source flow",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "india",
        },
        sources: ["cases"],
      },
    });

    expect(result.retrieval.sources).toHaveLength(1);
    expect(result.retrieval.evidence).toHaveLength(1);

    expect(result.evidenceSet.sources).toHaveLength(1);
    expect(result.evidenceSet.evidence).toHaveLength(1);

    expect(result.evidenceSet.verifications).toEqual([
      {
        sourceId: "source-1",
        status: "unverified",
        authorityConfirmed: false,
        jurisdictionConfirmed: false,
        notes: "Test verifier does not establish authority.",
      },
    ]);

    expect(result.evidenceSet.verifications[0].status).not.toBe(
      "verified",
    );
  });

  it("preserves the retrieved research source status", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      retriever: new FakeLegalSourceRetriever(),
      verifier: new FakeLegalSourceVerifier(),
    });

    const result = await orchestrator.execute({
      query: {
        query: "Test source status",
        sources: ["cases"],
      },
    });

    expect(result.research.sources).toHaveLength(1);
    expect(result.research.sources[0].verificationStatus).toBe(
      "unverified",
    );
    expect(result.research.totalResults).toBe(1);
  });
});
