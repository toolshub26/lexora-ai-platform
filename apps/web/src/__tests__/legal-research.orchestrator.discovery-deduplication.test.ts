import { describe, expect, it } from "vitest";
import type {
  LegalSourceCandidate,
  LegalSourceDiscoveryProvider,
} from "@/features/legal-research/discovery";
import { DefaultLegalResearchOrchestrator } from "@/features/legal-research/orchestrator";
import type {
  LegalRetrievalResult,
  LegalSourceRetriever,
} from "@/features/legal-research/retrieval";
import type {
  LegalSourceVerifier,
  LegalVerificationResult,
} from "@/features/legal-research/verification";

const duplicateCandidate: LegalSourceCandidate = {
  id: "candidate-duplicate",
  title: "Example Primary Source",
  sourceType: "cases",
  jurisdiction: {
    countryCode: "IN",
    jurisdictionId: "country:IN",
  },
  authorityId: "IN:SC",
  authorityName: "Example Court",
  sourceUrl: "https://example.gov/source",
  citation: "Example Citation",
  relevance: 1,
};

class DuplicateDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  async discover() {
    return {
      candidates: [
        duplicateCandidate,
        { ...duplicateCandidate },
      ],
    };
  }
}

class CandidateCapturingRetriever
  implements LegalSourceRetriever
{
  receivedCandidates: readonly LegalSourceCandidate[] = [];

  async retrieve(
    request: Parameters<LegalSourceRetriever["retrieve"]>[0],
  ): Promise<LegalRetrievalResult> {
    this.receivedCandidates = request.candidates ?? [];

    return {
      sources: [],
      evidence: [],
      researchSources: [],
    };
  }
}

class EmptyVerifier implements LegalSourceVerifier {
  async verify(): Promise<LegalVerificationResult> {
    return {
      verifications: [],
      citations: [],
    };
  }
}

describe("DefaultLegalResearchOrchestrator discovery deduplication", () => {
  it("should not forward duplicate candidate IDs to retrieval", async () => {
    const retriever = new CandidateCapturingRetriever();

    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new DuplicateDiscoveryProvider(),
      retriever,
      verifier: new EmptyVerifier(),
    });

    await orchestrator.execute({
      query: {
        query: "Test duplicate discovery",
        sources: ["cases"],
      },
    });

    expect(retriever.receivedCandidates).toHaveLength(1);
    expect(retriever.receivedCandidates[0].id).toBe(
      "candidate-duplicate",
    );
  });
});
