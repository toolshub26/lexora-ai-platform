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

class FailingDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  async discover(): Promise<never> {
    throw new Error("Source discovery failed");
  }
}

class UnexpectedRetriever implements LegalSourceRetriever {
  async retrieve(): Promise<LegalRetrievalResult> {
    throw new Error(
      "Retriever must not run when discovery fails",
    );
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

describe("DefaultLegalResearchOrchestrator discovery failure", () => {
  it("propagates discovery failure instead of silently returning an empty result", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new FailingDiscoveryProvider(),
      retriever: new UnexpectedRetriever(),
      verifier: new EmptyVerifier(),
    });

    await expect(
      orchestrator.execute({
        query: {
          query: "Test discovery failure",
          sources: ["cases"],
        },
      }),
    ).rejects.toThrow("Source discovery failed");
  });
});
