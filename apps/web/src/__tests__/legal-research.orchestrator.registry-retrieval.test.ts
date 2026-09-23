import { describe, expect, it } from "vitest";
import type {
  LegalSourceCandidate,
  LegalSourceDiscoveryProvider,
} from "@/features/legal-research/discovery";
import { DefaultLegalResearchOrchestrator } from "@/features/legal-research/orchestrator";
import { RegistryLegalSourceRetriever } from "@/features/legal-research/registry-retrieval";
import type {
  LegalSourceRecord,
  LegalSourceRegistry,
} from "@/features/legal-research/sources";
import type {
  LegalSourceVerifier,
  LegalVerificationResult,
} from "@/features/legal-research/verification";

const source: LegalSourceRecord = {
  id: "source-in-case-1",
  title: "Indian Supreme Court Case",
  citation: "Example Citation 2026",
  sourceType: "cases",
  authorityLevel: "primary",
  jurisdiction: {
    countryCode: "IN",
    jurisdictionId: "india",
  },
  authorityId: "supreme-court-india",
  authorityName: "Supreme Court of India",
  sourceUrl: "https://example.gov/case",
  availability: "available",
  retrievedAt: new Date(),
};

const candidate: LegalSourceCandidate = {
  id: "source-in-case-1",
  title: "Indian Supreme Court Case",
  sourceType: "cases",
  jurisdiction: {
    countryCode: "IN",
    jurisdictionId: "india",
  },
  authorityId: "supreme-court-india",
  authorityName: "Supreme Court of India",
  sourceUrl: "https://example.gov/case",
  citation: "Example Citation 2026",
};

class RegistryDiscoveryProvider
  implements LegalSourceDiscoveryProvider
{
  async discover() {
    return {
      candidates: [candidate],
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

describe(
  "DefaultLegalResearchOrchestrator registry retrieval integration",
  () => {
    it("should pass registry-retrieved sources through the orchestration result", async () => {
      const registry: LegalSourceRegistry = {
        getById: (id) => (id === source.id ? source : undefined),
        getByJurisdiction: () => [],
        getByType: () => [],
        getByAuthority: () => [],
      };

      const orchestrator =
        new DefaultLegalResearchOrchestrator({
          discovery: new RegistryDiscoveryProvider(),
          retriever: new RegistryLegalSourceRetriever(registry),
          verifier: new EmptyVerifier(),
        });

      const result = await orchestrator.execute({
        query: {
          query: "Indian Supreme Court case",
          jurisdiction: {
            countryCode: "IN",
            jurisdictionId: "india",
          },
          sources: ["cases"],
        },
      });

      expect(result.retrieval.sources).toHaveLength(1);
      expect(result.retrieval.sources[0]).toEqual(source);
      expect(result.evidenceSet.sources).toEqual([source]);
    });
  },
);
