import { describe, expect, it } from "vitest";
import type { LegalAuthority } from "../features/legal-research/authorities";
import { createLegalAuthorityRegistry } from "../features/legal-research/authority-registry";

describe("createLegalAuthorityRegistry", () => {
  it("creates a registry from supplied authorities", async () => {
    const authorities: LegalAuthority[] = [
      {
        id: "test:india:sc",
        name: "Test Supreme Court",
        type: "court",
        countryCode: "IN",
        jurisdictionId: "country:IN",
        active: true,
      },
    ];

    const registry = await createLegalAuthorityRegistry(authorities);

    expect(registry.getById("test:india:sc")?.name).toBe(
      "Test Supreme Court",
    );
  });

  it("preserves jurisdiction-aware authority lookup", async () => {
    const authorities: LegalAuthority[] = [
      {
        id: "test:india:sc",
        name: "Test Supreme Court",
        type: "court",
        countryCode: "IN",
        jurisdictionId: "country:IN",
        active: true,
      },
      {
        id: "test:us:court",
        name: "Test US Court",
        type: "court",
        countryCode: "US",
        jurisdictionId: "country:US",
        active: true,
      },
    ];

    const registry = await createLegalAuthorityRegistry(authorities);

    expect(registry.getByJurisdiction("country:IN")).toHaveLength(1);
    expect(registry.getByCountry("US")).toHaveLength(1);
  });

  it("returns an independent registry instance", async () => {
    const authorities: LegalAuthority[] = [
      {
        id: "test:authority",
        name: "Test Authority",
        type: "court",
        countryCode: "XX",
        active: true,
      },
    ];

    const first = await createLegalAuthorityRegistry(authorities);
    const second = await createLegalAuthorityRegistry(authorities);

    expect(first).not.toBe(second);
    expect(first.getById("test:authority")).toEqual(
      second.getById("test:authority"),
    );
  });
});

describe("createLegalAuthorityRegistry jurisdiction dependency", () => {
  it("passes the jurisdiction registry to authority validation", async () => {
    const authorities: LegalAuthority[] = [
      {
        id: "test:valid-authority",
        name: "Valid Authority",
        type: "court",
        countryCode: "IN",
        jurisdictionId: "country:IN",
        active: true,
      },
    ];

    const jurisdictionRegistry = {
      getById: (id: string) =>
        id === "country:IN"
          ? {
              id: "country:IN",
              name: "India",
              level: "country" as const,
              countryCode: "IN",
              active: true,
            }
          : undefined,
      getChildren: () => [],
      getCountry: () => undefined,
      resolve: () => undefined,
    };

    const registry = await createLegalAuthorityRegistry(
      authorities,
      jurisdictionRegistry,
    );

    expect(
      registry.getById("test:valid-authority")?.jurisdictionId,
    ).toBe("country:IN");
  });

  it("rejects an authority referencing an unknown jurisdiction", async () => {
    const authorities: LegalAuthority[] = [
      {
        id: "test:invalid-authority",
        name: "Invalid Authority",
        type: "court",
        countryCode: "IN",
        jurisdictionId: "country:UNKNOWN",
        active: true,
      },
    ];

    const jurisdictionRegistry = {
      getById: () => undefined,
      getChildren: () => [],
      getCountry: () => undefined,
      resolve: () => undefined,
    };

    await expect(
      createLegalAuthorityRegistry(
        authorities,
        jurisdictionRegistry,
      ),
    ).rejects.toThrow(/unknown jurisdiction/i);
  });
});

describe("createLegalAuthorityRegistry with canonical jurisdictions", () => {
  it("accepts an authority referencing a canonical jurisdiction", async () => {
    const { createLegalJurisdictionRegistry } = await import(
      "../features/legal-research/jurisdiction-registry"
    );

    const jurisdictionRegistry =
      await createLegalJurisdictionRegistry();

    const authorities: LegalAuthority[] = [
      {
        id: "test:india:authority",
        name: "Test India Authority",
        type: "court",
        countryCode: "IN",
        jurisdictionId: "country:IN",
        active: true,
      },
    ];

    const registry = await createLegalAuthorityRegistry(
      authorities,
      jurisdictionRegistry,
    );

    expect(
      registry.getById("test:india:authority")?.jurisdictionId,
    ).toBe("country:IN");
  });

  it("rejects an authority referencing a non-existent canonical jurisdiction", async () => {
    const { createLegalJurisdictionRegistry } = await import(
      "../features/legal-research/jurisdiction-registry"
    );

    const jurisdictionRegistry =
      await createLegalJurisdictionRegistry();

    await expect(
      createLegalAuthorityRegistry(
        [
          {
            id: "test:invalid",
            name: "Invalid Authority",
            type: "court",
            countryCode: "IN",
            jurisdictionId: "country:DOES-NOT-EXIST",
            active: true,
          },
        ],
        jurisdictionRegistry,
      ),
    ).rejects.toThrow(/unknown jurisdiction/i);
  });
});

describe("createLegalAuthorityRegistry canonical dataset", () => {
  it("loads authorities from the canonical authority dataset", async () => {
    const registry = await createLegalAuthorityRegistry();

    expect(registry.getByCountry("IN")).toHaveLength(2);
  });
});
