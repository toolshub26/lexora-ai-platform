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
  LegalSynthesisInput,
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

class VerifiedRetriever
  implements LegalSourceRetriever
{
  async retrieve(): Promise<LegalRetrievalResult> {
    return {
      sources: [
        {
          id: "source-hard-failure-1",
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
          sourceId: "source-hard-failure-1",
          citation: "Verified Citation",
          verificationStatus: "unverified",
        },
      ],
    };
  }
}

class Verifier
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

class InvalidCitationSynthesisProvider
  implements LegalSynthesisProvider
{
  async synthesize(
    _input: LegalSynthesisInput,
  ): Promise<LegalSynthesisResult> {
    return {
      summary: "Invalid synthesis",
      citationIds: ["fabricated-citation"],
    };
  }
}

describe(
  "DefaultLegalResearchOrchestrator synthesis citation failure",
  () => {
    it("should fail when synthesis returns an invalid citation ID", async () => {
      const orchestrator =
        new DefaultLegalResearchOrchestrator({
          discovery: new EmptyDiscoveryProvider(),
          retriever: new VerifiedRetriever(),
          verifier: new Verifier(),
          synthesis: new InvalidCitationSynthesisProvider(),
        });

      await expect(
        orchestrator.execute({
          query: {
            query: "Test synthesis citation failure",
            sources: ["cases"],
          },
        }),
      ).rejects.toThrow(
        "Legal synthesis returned invalid citation IDs: fabricated-citation",
      );
    });
  },
);
