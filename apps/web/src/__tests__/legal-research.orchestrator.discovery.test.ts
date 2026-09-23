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

class FakeDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  readonly candidates: LegalSourceCandidate[] = [
    {
      id: "candidate-1",
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
    },
  ];

  async discover() {
    return {
      candidates: this.candidates,
    };
  }
}

class CandidateCapturingRetriever
  implements LegalSourceRetriever
{
  receivedCandidates: readonly LegalSourceCandidate[] | undefined;

  async retrieve(request: {
    query: Parameters<LegalSourceRetriever["retrieve"]>[0]["query"];
    candidates?: readonly LegalSourceCandidate[];
  }): Promise<LegalRetrievalResult> {
    this.receivedCandidates = request.candidates;

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

describe("DefaultLegalResearchOrchestrator discovery flow", () => {
  it("forwards discovered candidates to the retriever", async () => {
    const discovery = new FakeDiscoveryProvider();
    const retriever = new CandidateCapturingRetriever();

    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery,
      retriever,
      verifier: new EmptyVerifier(),
    });

    await orchestrator.execute({
      query: {
        query: "Test discovery flow",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "country:IN",
        },
        sources: ["cases"],
      },
    });

    expect(retriever.receivedCandidates).toEqual(
      discovery.candidates,
    );
  });
});
