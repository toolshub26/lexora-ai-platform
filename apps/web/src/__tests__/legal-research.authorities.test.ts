import {
  InMemoryLegalAuthorityRegistry,
  type LegalAuthority,
} from "@/features/legal-research/authorities";

describe("InMemoryLegalAuthorityRegistry", () => {
  const authorities: LegalAuthority[] = [
    {
      id: "IN:SC",
      name: "Supreme Court of India",
      type: "court",
      countryCode: "IN",
      active: true,
    },
    {
      id: "IN:J&K:HC",
      name: "High Court",
      type: "court",
      countryCode: "IN",
      jurisdictionId: "IN:JAMMU-AND-KASHMIR",
      active: true,
    },
    {
      id: "IN:J&K:TRIBUNAL",
      name: "Regional Tribunal",
      type: "tribunal",
      countryCode: "IN",
      jurisdictionId: "IN:JAMMU-AND-KASHMIR",
      active: true,
    },
  ];

  it("should resolve an authority by ID", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getById("IN:SC")?.name).toBe(
      "Supreme Court of India",
    );
  });

  it("should return authorities for a jurisdiction", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(
      registry.getByJurisdiction("IN:JAMMU-AND-KASHMIR"),
    ).toHaveLength(2);
  });

  it("should return authorities for a country", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getByCountry("IN")).toHaveLength(3);
  });

  it("should normalize country codes", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getByCountry("in")).toHaveLength(3);
  });

  it("should return an empty list for an unknown jurisdiction", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getByJurisdiction("unknown")).toEqual([]);
  });

  it("should return undefined for an unknown authority", () => {
    const registry = new InMemoryLegalAuthorityRegistry(authorities);

    expect(registry.getById("unknown")).toBeUndefined();
  });
});
