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
import type {
  LegalSynthesisProvider,
  LegalSynthesisResult,
} from "@/features/legal-research/synthesis";

class EmptyDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  async discover() {
    return {
      candidates: [],
    };
  }
}

class EmptyRetriever
  implements LegalSourceRetriever
{
  async retrieve(): Promise<LegalRetrievalResult> {
    return {
      sources: [
        {
          id: "source-final-1",
          title: "Verified Source",
          citation: "Verified Citation",
          sourceType: "cases",
          authorityLevel: "primary",
          availability: "available",
          retrievedAt: new Date(),
        },
      ],
      evidence: [],
      researchSources: [],
      citations: [
        {
          sourceId: "source-final-1",
          citation: "Verified Citation",
          verificationStatus: "unverified",
        },
      ],
    };
  }
}

class EmptyVerifier
  implements LegalSourceVerifier
{
  async verify(
    request: Parameters<LegalSourceVerifier["verify"]>[0],
  ): Promise<LegalVerificationResult> {
    return {
      verifications: request.sources.map((source) => ({
        sourceId: source.id,
        status: "verified",
        verifiedAt: new Date(),
        authorityConfirmed: true,
        jurisdictionConfirmed: true,
      })),
      citations: request.citations.map((citation) => ({
        ...citation,
        verificationStatus: "verified",
      })),
    };
  }
}

class FixedSynthesisProvider
  implements LegalSynthesisProvider
{
  async synthesize(): Promise<LegalSynthesisResult> {
    return {
      summary: "Verified synthesis result.",
      citationIds: ["source-final-1"],
    };
  }
}

describe("DefaultLegalResearchOrchestrator synthesis result", () => {
  it("should expose the synthesis result in the orchestration result", async () => {
    const orchestrator =
      new DefaultLegalResearchOrchestrator({
        discovery: new EmptyDiscoveryProvider(),
        retriever: new EmptyRetriever(),
        verifier: new EmptyVerifier(),
        synthesis: new FixedSynthesisProvider(),
      });

    const result = await orchestrator.execute({
      query: {
        query: "Test final synthesis result",
        sources: ["cases"],
      },
    });

    expect(result.synthesis).toEqual({
      summary: "Verified synthesis result.",
      citationIds: ["source-final-1"],
    });
  });
});
