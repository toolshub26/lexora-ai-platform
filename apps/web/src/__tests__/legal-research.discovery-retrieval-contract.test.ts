import { describe, expect, it } from "vitest";
import type { LegalSourceCandidate } from "@/features/legal-research/discovery";
import type { LegalRetrievalResult } from "@/features/legal-research/retrieval";

describe("Legal Research discovery-to-retrieval contract", () => {
  it("should represent discovered candidates before retrieval", () => {
    const candidates: LegalSourceCandidate[] = [
      {
        id: "candidate-1",
        title: "Example Primary Source",
        sourceType: "cases",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "country:IN",
        },
        authorityId: "IN:SC",
        authorityName: "Example Court",
        sourceUrl: "https://example.gov/source",
        citation: "Example Citation",
        relevance: 1,
      },
    ];

    expect(candidates).toHaveLength(1);
    expect(candidates[0].id).toBe("candidate-1");
    expect(candidates[0].sourceType).toBe("cases");
  });

  it("should keep retrieval output distinct from discovery candidates", () => {
    const retrievalResult: LegalRetrievalResult = {
      sources: [],
      evidence: [],
      researchSources: [],
    };

    expect(retrievalResult).toEqual({
      sources: [],
      evidence: [],
      researchSources: [],
    });
  });
});
