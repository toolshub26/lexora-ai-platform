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

class RecordingVerifier
  implements LegalSourceVerifier
{
  constructor(private readonly events: string[]) {}

  async verify(): Promise<LegalVerificationResult> {
    this.events.push("verification");

    return {
      verifications: [],
      citations: [],
    };
  }
}

class RecordingSynthesisProvider
  implements LegalSynthesisProvider
{
  constructor(private readonly events: string[]) {}

  async synthesize(
    _input: LegalSynthesisInput,
  ): Promise<LegalSynthesisResult> {
    this.events.push("synthesis");

    return {
      summary: "Synthesized result",
      citationIds: [],
    };
  }
}

describe("DefaultLegalResearchOrchestrator synthesis order", () => {
  it("should run synthesis only after verification", async () => {
    const events: string[] = [];

    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new EmptyDiscoveryProvider(),
      retriever: new EmptyRetriever(),
      verifier: new RecordingVerifier(events),
      synthesis: new RecordingSynthesisProvider(events),
    });

    await orchestrator.execute({
      query: {
        query: "Test synthesis order",
        sources: ["cases"],
      },
    });

    expect(events).toEqual([
      "verification",
      "synthesis",
    ]);
  });
});
