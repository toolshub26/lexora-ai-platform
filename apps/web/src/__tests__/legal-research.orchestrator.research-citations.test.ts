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
  LegalCitation,
  LegalSourceRecord,
} from "@/features/legal-research/sources";
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

class CitationProducingRetriever
  implements LegalSourceRetriever
{
  async retrieve(): Promise<LegalRetrievalResult> {
    const source: LegalSourceRecord = {
      id: "source-research-citation-1",
      title: "Example Source",
      citation: "Example Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      availability: "available",
      retrievedAt: new Date(),
    };

    return {
      sources: [source],
      evidence: [],
      researchSources: [
        {
          id: source.id,
          title: source.title,
          citation: source.citation,
          sourceType: source.sourceType,
          sourceUrl: source.sourceUrl,
          snippet: "Example verified source",
          relevance: 1,
          verificationStatus: "unverified",
          retrievedAt: source.retrievedAt,
        },
      ],
      citations: [
        {
          sourceId: source.id,
          evidenceId: "evidence-research-citation-1",
          citation: source.citation,
          verificationStatus: "unverified",
        },
      ],
    };
  }
}

class CitationVerifier
  implements LegalSourceVerifier
{
  async verify(request: {
    sources: LegalSourceRecord[];
    evidence: [];
    citations: LegalCitation[];
  }): Promise<LegalVerificationResult> {
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

describe("DefaultLegalResearchOrchestrator research citations", () => {
  it("exposes verified citations in the final research result", async () => {
    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new EmptyDiscoveryProvider(),
      retriever: new CitationProducingRetriever(),
      verifier: new CitationVerifier(),
    });

    const result = await orchestrator.execute({
      query: {
        query: "Test final research citation",
        sources: ["cases"],
      },
    });

    expect(result.research.citations).toEqual([
      {
        sourceId: "source-research-citation-1",
        evidenceId: "evidence-research-citation-1",
        citation: "Example Citation",
        verificationStatus: "verified",
      },
    ]);
  });
});
