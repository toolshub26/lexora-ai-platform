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

class FailingRetriever implements LegalSourceRetriever {
  async retrieve(): Promise<LegalRetrievalResult> {
    throw new Error("Source retrieval failed");
  }
}

class UnexpectedVerifier implements LegalSourceVerifier {
  async verify(): Promise<LegalVerificationResult> {
    throw new Error(
      "Verifier must not run when retrieval fails",
    );
  }
}

describe("DefaultLegalResearchOrchestrator retrieval failure", () => {
  it("propagates retrieval failure instead of silently returning an empty result", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new EmptyDiscoveryProvider(),
      retriever: new FailingRetriever(),
      verifier: new UnexpectedVerifier(),
    });

    await expect(
      orchestrator.execute({
        query: {
          query: "Test retrieval failure",
          sources: ["cases"],
        },
      }),
    ).rejects.toThrow("Source retrieval failed");
  });
});
