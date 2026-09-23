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

class EvidenceRetriever
  implements LegalSourceRetriever
{
  async retrieve(): Promise<LegalRetrievalResult> {
    const retrievedAt = new Date();

    return {
      sources: [
        {
          id: "source-input-1",
          title: "Example Primary Source",
          citation: "Example Citation",
          sourceType: "cases",
          authorityLevel: "primary",
          availability: "available",
          retrievedAt,
        },
      ],
      evidence: [
        {
          id: "evidence-input-1",
          sourceId: "source-input-1",
          kind: "excerpt",
          excerpt: "Verified legal text.",
          retrievedAt,
        },
      ],
      researchSources: [],
      citations: [
        {
          sourceId: "source-input-1",
          evidenceId: "evidence-input-1",
          citation: "Example Citation",
          verificationStatus: "unverified",
        },
      ],
    };
  }
}

class VerificationProvider
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

class CapturingSynthesisProvider
  implements LegalSynthesisProvider
{
  receivedInput?: LegalSynthesisInput;

  async synthesize(
    input: LegalSynthesisInput,
  ): Promise<LegalSynthesisResult> {
    this.receivedInput = input;

    return {
      summary: "Synthesized from verified evidence.",
      citationIds: input.citations.map(
        (citation) => citation.sourceId,
      ),
    };
  }
}

describe("DefaultLegalResearchOrchestrator synthesis input", () => {
  it("passes the verified evidence set into synthesis", async () => {
    const synthesis = new CapturingSynthesisProvider();

    const orchestrator =
      new DefaultLegalResearchOrchestrator({
        discovery: new EmptyDiscoveryProvider(),
        retriever: new EvidenceRetriever(),
        verifier: new VerificationProvider(),
        synthesis,
      });

    await orchestrator.execute({
      query: {
        query: "Test synthesis input integrity",
        sources: ["cases"],
      },
    });

    expect(synthesis.receivedInput).toEqual({
      query: "Test synthesis input integrity",
      sources: expect.arrayContaining([
        expect.objectContaining({
          id: "source-input-1",
        }),
      ]),
      evidence: expect.arrayContaining([
        expect.objectContaining({
          id: "evidence-input-1",
          sourceId: "source-input-1",
        }),
      ]),
      verifications: expect.arrayContaining([
        expect.objectContaining({
          sourceId: "source-input-1",
          status: "verified",
        }),
      ]),
      citations: expect.arrayContaining([
        expect.objectContaining({
          sourceId: "source-input-1",
          evidenceId: "evidence-input-1",
          verificationStatus: "verified",
        }),
      ]),
    });
  });
});
