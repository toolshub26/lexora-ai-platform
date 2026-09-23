import { describe, expect, it } from "vitest";
import {
  InMemoryLegalAuthorityRegistry,
  type LegalAuthority,
} from "@/features/legal-research/authorities";

describe("InMemoryLegalAuthorityRegistry", () => {
  const authorities: LegalAuthority[] = [
    {
      id: "authority:india:sc",
      name: "Supreme Court",
      type: "court",
      countryCode: "IN",
      jurisdictionId: "country:IN",
      active: true,
    },
    {
      id: "authority:india:tribunal",
      name: "Example Tribunal",
      type: "tribunal",
      countryCode: "IN",
      jurisdictionId: "country:IN",
      parentAuthorityId: "authority:india:sc",
      active: true,
    },
    {
      id: "authority:us:court",
      name: "Example US Court",
      type: "court",
      countryCode: "US",
      jurisdictionId: "country:US",
      active: true,
    },
  ];

  it("gets an authority by id", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getById("authority:india:sc")?.name).toBe(
      "Supreme Court",
    );
  });

  it("returns undefined for an unknown authority", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getById("missing")).toBeUndefined();
  });

  it("gets authorities by jurisdiction", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getByJurisdiction("country:IN")).toHaveLength(2);
  });

  it("gets authorities by country case-insensitively", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getByCountry("in")).toHaveLength(2);
  });

  it("does not return authorities from another country", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getByCountry("US")).toHaveLength(1);
  });

  it("supports parent authority references", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(
      registry.getById("authority:india:tribunal")?.parentAuthorityId,
    ).toBe("authority:india:sc");
  });

  it("allows an empty registry", () => {
    const registry = new InMemoryLegalAuthorityRegistry();

    expect(registry.getByCountry("IN")).toEqual([]);
    expect(registry.getByJurisdiction("country:IN")).toEqual([]);
  });
});
