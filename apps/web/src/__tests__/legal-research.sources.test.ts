import { describe, expect, it } from "vitest";
import {
  InMemoryLegalSourceRegistry,
  type LegalSourceRecord,
} from "../features/legal-research/sources";

const sources: LegalSourceRecord[] = [
  {
    id: "source-in-1",
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
    availability: "available",
    retrievedAt: new Date(),
  },
  {
    id: "source-in-2",
    title: "Indian Statute",
    citation: "Example Statute 2026",
    sourceType: "statutes",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "india",
    },
    availability: "available",
    retrievedAt: new Date(),
  },
  {
    id: "source-us-1",
    title: "US Secondary Commentary",
    citation: "Example Commentary 2026",
    sourceType: "secondary",
    authorityLevel: "secondary",
    jurisdiction: {
      countryCode: "US",
      jurisdictionId: "united-states",
    },
    availability: "available",
    retrievedAt: new Date(),
  },
];

describe("InMemoryLegalSourceRegistry", () => {
  const registry = new InMemoryLegalSourceRegistry(sources);

  it("gets a source by id", () => {
    expect(registry.getById("source-in-1")?.title).toBe(
      "Indian Supreme Court Case",
    );
  });

  it("returns undefined for an unknown source", () => {
    expect(registry.getById("missing")).toBeUndefined();
  });

  it("gets sources by jurisdiction id", () => {
    expect(
      registry.getByJurisdiction({
        jurisdictionId: "india",
      }),
    ).toHaveLength(2);
  });

  it("matches jurisdiction country code case-insensitively", () => {
    expect(
      registry.getByJurisdiction({
        countryCode: "in",
      }),
    ).toHaveLength(2);
  });

  it("filters by source type", () => {
    expect(registry.getByType("cases")).toHaveLength(1);
    expect(registry.getByType("statutes")).toHaveLength(1);
    expect(registry.getByType("secondary")).toHaveLength(1);
  });

  it("filters by authority", () => {
    expect(
      registry.getByAuthority("supreme-court-india"),
    ).toHaveLength(1);
  });

  it("does not match a different jurisdiction", () => {
    expect(
      registry.getByJurisdiction({
        jurisdictionId: "united-states",
      }),
    ).toHaveLength(1);
  });
});
