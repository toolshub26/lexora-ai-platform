import { describe, expect, it } from "vitest";
import type { LegalSourceCandidate } from "@/features/legal-research/discovery";
import type { LegalRetrievalRequest } from "@/features/legal-research/retrieval";

describe("Legal Source Retriever candidate contract", () => {
  it("should allow retrieval to receive discovered source candidates", () => {
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

    const request: LegalRetrievalRequest = {
      query: {
        query: "Example legal research query",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "country:IN",
        },
        sources: ["cases"],
      },
      candidates,
    };

    expect(request.candidates).toHaveLength(1);
    const retrievedCandidates = request.candidates ?? [];

    expect(retrievedCandidates).toHaveLength(1);
    expect(retrievedCandidates[0].id).toBe("candidate-1");
    expect(retrievedCandidates[0].sourceType).toBe("cases");
  });
});
