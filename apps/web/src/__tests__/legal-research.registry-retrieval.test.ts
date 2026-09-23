import { describe, expect, it } from "vitest";
import type { LegalSourceCandidate } from "@/features/legal-research/discovery";
import {
  RegistryLegalSourceRetriever,
} from "@/features/legal-research/registry-retrieval";
import type { LegalSourceRegistry } from "@/features/legal-research/sources";

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

describe("RegistryLegalSourceRetriever", () => {
  it("should retrieve a discovered candidate as a canonical source", async () => {
    const registry: LegalSourceRegistry = {
      getById: (id) =>
        id === "source-in-case-1"
          ? {
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
            }
          : undefined,
      getByJurisdiction: () => [],
      getByType: () => [],
      getByAuthority: () => [],
    };

    const retriever = new RegistryLegalSourceRetriever(
      registry,
    );

    const result = await retriever.retrieve({
      query: {
        query: "Indian Supreme Court case",
        sources: ["cases"],
      },
      candidates: [candidate],
    });

    expect(result.sources).toHaveLength(1);
    expect(result.sources[0]).toMatchObject({
      id: "source-in-case-1",
      title: "Indian Supreme Court Case",
      sourceType: "cases",
      authorityLevel: "primary",
      availability: "available",
    });
  });

  it("should reject a candidate that is missing from the source registry", async () => {
    const registry: LegalSourceRegistry = {
      getById: () => undefined,
      getByJurisdiction: () => [],
      getByType: () => [],
      getByAuthority: () => [],
    };

    const retriever = new RegistryLegalSourceRetriever(
      registry,
    );

    await expect(
      retriever.retrieve({
        query: {
          query: "Missing source",
          sources: ["cases"],
        },
        candidates: [candidate],
      }),
    ).rejects.toThrow(
      'Legal source candidate "source-in-case-1" was not found in the source registry.',
    );
  });
});
