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

const candidates: LegalSourceCandidate[] = [
  {
    id: "candidate-a",
    title: "Source A",
    sourceType: "cases",
    relevance: 1,
  },
  {
    id: "candidate-b",
    title: "Source B",
    sourceType: "statutes",
    relevance: 0.9,
  },
  {
    id: "candidate-a",
    title: "Source A Duplicate",
    sourceType: "cases",
    relevance: 0.8,
  },
];

class OrderedDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  async discover() {
    return { candidates };
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

describe("DefaultLegalResearchOrchestrator discovery order", () => {
  it("preserves first-seen order while removing duplicate IDs", async () => {
    const retriever = new CandidateCapturingRetriever();

    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new OrderedDiscoveryProvider(),
      retriever,
      verifier: new EmptyVerifier(),
    });

    await orchestrator.execute({
      query: {
        query: "Test discovery order",
        sources: ["cases", "statutes"],
      },
    });

    expect(
      retriever.receivedCandidates.map((candidate) => candidate.id),
    ).toEqual(["candidate-a", "candidate-b"]);
  });
});
