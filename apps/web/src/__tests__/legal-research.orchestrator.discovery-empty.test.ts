import { describe, expect, it } from "vitest";
import type {
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

class EmptyDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  async discover() {
    return {
      candidates: [],
    };
  }
}

class CandidateCapturingRetriever
  implements LegalSourceRetriever
{
  receivedCandidates: readonly unknown[] | undefined;

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

describe("DefaultLegalResearchOrchestrator empty discovery", () => {
  it("passes an empty candidate set to retrieval and returns an empty result", async () => {
    const retriever = new CandidateCapturingRetriever();

    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new EmptyDiscoveryProvider(),
      retriever,
      verifier: new EmptyVerifier(),
    });

    const result = await orchestrator.execute({
      query: {
        query: "Test empty discovery",
        sources: ["cases"],
      },
    });

    expect(retriever.receivedCandidates).toEqual([]);
    expect(result.retrieval.sources).toEqual([]);
    expect(result.retrieval.evidence).toEqual([]);
    expect(result.research.sources).toEqual([]);
    expect(result.research.totalResults).toBe(0);
  });
});
