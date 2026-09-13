import {
  InMemoryLegalAuthorityRegistry,
  type LegalAuthority,
} from "@/features/legal-research/authorities";
import type {LegalJurisdictionRegistry} from "@/features/legal-research/jurisdictions";

describe("LegalAuthorityRegistry jurisdiction dependency", () => {
  const jurisdictionRegistry: LegalJurisdictionRegistry = {
    getById: (id) =>
      id === "country:IN"
        ? {
            id: "country:IN",
            name: "India",
            level: "country",
            countryCode: "IN",
            active: true,
          }
        : id === "IN:JAMMU-AND-KASHMIR"
          ? {
              id: "IN:JAMMU-AND-KASHMIR",
              name: "Jammu and Kashmir",
              level: "region",
              countryCode: "IN",
              parentJurisdictionId: "country:IN",
              active: true,
            }
          : undefined,
    getChildren: () => [],
    getCountry: (countryCode) =>
      countryCode.toUpperCase() === "IN"
        ? {
            id: "country:IN",
            name: "India",
            level: "country",
            countryCode: "IN",
            active: true,
          }
        : undefined,
    resolve: () => undefined,
  };

  it("should accept authorities with valid jurisdiction references", () => {
    const authorities: LegalAuthority[] = [
      {
        id: "IN:SC",
        name: "Supreme Court of India",
        type: "court",
        countryCode: "IN",
        jurisdictionId: "country:IN",
        active: true,
      },
    ];

    const registry = new InMemoryLegalAuthorityRegistry(
      authorities,
      jurisdictionRegistry,
    );

    expect(registry.getById("IN:SC")?.name).toBe(
      "Supreme Court of India",
    );
  });

  it("should reject an authority with an unknown jurisdiction", () => {
    const authorities: LegalAuthority[] = [
      {
        id: "IN:INVALID",
        name: "Invalid Authority",
        type: "court",
        countryCode: "IN",
        jurisdictionId: "IN:UNKNOWN",
        active: true,
      },
    ];

    expect(
      () =>
        new InMemoryLegalAuthorityRegistry(
          authorities,
          jurisdictionRegistry,
        ),
    ).toThrow(
      'Legal authority "IN:INVALID" references unknown jurisdiction "IN:UNKNOWN".',
    );
  });
});
