import { describe, expect, it } from "vitest";
import {
  InMemoryLegalSourceRegistry,
  type LegalSourceRecord,
} from "@/features/legal-research/sources";
import type { LegalSourceDiscoveryProvider } from "@/features/legal-research/discovery";
import {
  RegistryLegalSourceDiscoveryProvider,
} from "@/features/legal-research/registry-discovery";

const sources: LegalSourceRecord[] = [
  {
    id: "source-in-case-1",
    title: "Indian Supreme Court Case",
    citation: "Example Citation 2026",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "india",
      authorityId: "supreme-court-india",
    },
    authorityId: "supreme-court-india",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://example.gov/case",
    availability: "available",
    retrievedAt: new Date(),
  },
  {
    id: "source-in-statute-1",
    title: "Indian Statute",
    citation: "Example Statute 2026",
    sourceType: "statutes",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "india",
    },
    sourceUrl: "https://example.gov/statute",
    availability: "available",
    retrievedAt: new Date(),
  },
  {
    id: "source-us-case-1",
    title: "US Case",
    citation: "Example US Citation 2026",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "US",
      jurisdictionId: "united-states",
    },
    sourceUrl: "https://example.gov/us-case",
    availability: "available",
    retrievedAt: new Date(),
  },
];

describe(
  "RegistryLegalSourceDiscoveryProvider",
  () => {
    it("should discover sources matching jurisdiction and requested source type", async () => {
      const registry =
        new InMemoryLegalSourceRegistry(sources);

      const provider: LegalSourceDiscoveryProvider =
        new RegistryLegalSourceDiscoveryProvider(
          registry,
        );

      const result = await provider.discover({
        query: {
          query: "Indian Supreme Court case",
          jurisdiction: {
            countryCode: "IN",
            jurisdictionId: "india",
          },
          sources: ["cases"],
        },
      });

      expect(result.candidates).toHaveLength(1);
      expect(result.candidates[0]).toEqual({
        id: "source-in-case-1",
        title: "Indian Supreme Court Case",
        sourceType: "cases",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "india",
          authorityId: "supreme-court-india",
        },
        authorityId: "supreme-court-india",
        authorityName: "Supreme Court of India",
        sourceUrl: "https://example.gov/case",
        citation: "Example Citation 2026",
      });
    });

    it("should not return sources from another jurisdiction", async () => {
      const registry =
        new InMemoryLegalSourceRegistry(sources);

      const provider =
        new RegistryLegalSourceDiscoveryProvider(
          registry,
        );

      const result = await provider.discover({
        query: {
          query: "Indian case",
          jurisdiction: {
            countryCode: "IN",
            jurisdictionId: "india",
          },
          sources: ["cases"],
        },
      });

      expect(
        result.candidates.some(
          (candidate) => candidate.id === "source-us-case-1",
        ),
      ).toBe(false);
    });
  },
);
