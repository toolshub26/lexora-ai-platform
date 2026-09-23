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

class EmptyRetriever
  implements LegalSourceRetriever
{
  async retrieve(): Promise<LegalRetrievalResult> {
    return {
      sources: [],
      evidence: [],
      researchSources: [],
      citations: [],
    };
  }
}

class FailingVerifier
  implements LegalSourceVerifier
{
  async verify(): Promise<LegalVerificationResult> {
    throw new Error("Verification failed");
  }
}

class RecordingSynthesisProvider
  implements LegalSynthesisProvider
{
  called = false;

  async synthesize(
    _input: LegalSynthesisInput,
  ): Promise<LegalSynthesisResult> {
    this.called = true;

    return {
      summary: "Should not be synthesized",
      citationIds: [],
    };
  }
}

describe(
  "DefaultLegalResearchOrchestrator synthesis verification failure",
  () => {
    it("should not call synthesis when verification fails", async () => {
      const synthesis = new RecordingSynthesisProvider();

      const orchestrator =
        new DefaultLegalResearchOrchestrator({
          discovery: new EmptyDiscoveryProvider(),
          retriever: new EmptyRetriever(),
          verifier: new FailingVerifier(),
          synthesis,
        });

      await expect(
        orchestrator.execute({
          query: {
            query: "Test verification failure",
            sources: ["cases"],
          },
        }),
      ).rejects.toThrow("Verification failed");

      expect(synthesis.called).toBe(false);
    });
  },
);
