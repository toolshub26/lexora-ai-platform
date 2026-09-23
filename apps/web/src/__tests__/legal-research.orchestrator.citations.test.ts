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
      id: "source-citation-1",
      title: "Example Source",
      citation: "Example Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      availability: "available",
      retrievedAt: new Date(),
    };

    const citation: LegalCitation = {
      sourceId: source.id,
      evidenceId: "evidence-citation-1",
      citation: source.citation,
      verificationStatus: "unverified",
    };

    return {
      sources: [source],
      evidence: [],
      researchSources: [],
      citations: [citation],
    };
  }
}

class CitationCapturingVerifier
  implements LegalSourceVerifier
{
  receivedCitations: LegalCitation[] = [];

  async verify(request: {
    sources: LegalSourceRecord[];
    evidence: [];
    citations: LegalCitation[];
  }): Promise<LegalVerificationResult> {
    this.receivedCitations = request.citations;

    return {
      verifications: [],
      citations: request.citations,
    };
  }
}

describe("DefaultLegalResearchOrchestrator citation flow", () => {
  it("forwards retrieved citations to the verifier", async () => {
    const verifier = new CitationCapturingVerifier();

    const orchestrator = new DefaultLegalResearchOrchestrator({
      discovery: new EmptyDiscoveryProvider(),
      retriever: new CitationProducingRetriever(),
      verifier,
    });

    await orchestrator.execute({
      query: {
        query: "Test citation flow",
        sources: ["cases"],
      },
    });

    expect(verifier.receivedCitations).toEqual([
      {
        sourceId: "source-citation-1",
        evidenceId: "evidence-citation-1",
        citation: "Example Citation",
        verificationStatus: "unverified",
      },
    ]);
  });
});
