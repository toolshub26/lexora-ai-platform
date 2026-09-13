import {
  InMemoryLegalJurisdictionRegistry,
  type LegalJurisdiction,
} from "@/features/legal-research/jurisdictions";

describe("InMemoryLegalJurisdictionRegistry", () => {
  const jurisdictions: LegalJurisdiction[] = [
    {
      id: "country:IN",
      name: "India",
      level: "country",
      countryCode: "IN",
      active: true,
    },
    {
      id: "IN:JAMMU-AND-KASHMIR",
      name: "Jammu and Kashmir",
      level: "region",
      countryCode: "IN",
      parentJurisdictionId: "country:IN",
      active: true,
    },
    {
      id: "IN:DELHI",
      name: "Delhi",
      level: "federal-district",
      countryCode: "IN",
      parentJurisdictionId: "country:IN",
      active: true,
    },
  ];

  it("should resolve a jurisdiction by ID", () => {
    const registry = new InMemoryLegalJurisdictionRegistry(jurisdictions);

    expect(registry.getById("country:IN")?.name).toBe("India");
  });

  it("should resolve a country by country code", () => {
    const registry = new InMemoryLegalJurisdictionRegistry(jurisdictions);

    expect(registry.getCountry("in")?.id).toBe("country:IN");
  });

  it("should return direct child jurisdictions", () => {
    const registry = new InMemoryLegalJurisdictionRegistry(jurisdictions);

    expect(registry.getChildren("country:IN")).toHaveLength(2);
  });

  it("should resolve a jurisdiction reference by jurisdiction ID", () => {
    const registry = new InMemoryLegalJurisdictionRegistry(jurisdictions);

    expect(
      registry.resolve({
        jurisdictionId: "IN:DELHI",
      })?.name,
    ).toBe("Delhi");
  });

  it("should resolve a jurisdiction reference by country code", () => {
    const registry = new InMemoryLegalJurisdictionRegistry(jurisdictions);

    expect(
      registry.resolve({
        countryCode: "IN",
      })?.name,
    ).toBe("India");
  });

  it("should return undefined for an unknown reference", () => {
    const registry = new InMemoryLegalJurisdictionRegistry(jurisdictions);

    expect(
      registry.resolve({
        jurisdictionId: "unknown",
      }),
    ).toBeUndefined();
  });
});
