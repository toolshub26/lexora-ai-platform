import { describe, expect, it } from "vitest";
import {
  createLegalSourceRegistry,
} from "./source-registry";
import {
  InMemoryLegalAuthorityRegistry,
  type LegalAuthority,
} from "./authorities";
import {
  InMemoryLegalJurisdictionRegistry,
  type LegalJurisdiction,
} from "./jurisdictions";
import type {LegalSourceRecord} from "./sources";

const jurisdiction: LegalJurisdiction = {
  id: "country:IN",
  name: "India",
  level: "country",
  countryCode: "IN",
  active: true,
};

const usJurisdiction: LegalJurisdiction = {
  id: "country:US",
  name: "United States",
  level: "country",
  countryCode: "US",
  active: true,
};

const jkJurisdiction: LegalJurisdiction = {
  id: "IN-JK",
  name: "Jammu and Kashmir",
  level: "state",
  countryCode: "IN",
  parentJurisdictionId: "country:IN",
  active: true,
};

const authority: LegalAuthority = {
  id: "court:in:supreme-court",
  name: "Supreme Court of India",
  type: "court",
  countryCode: "IN",
  jurisdictionId: "country:IN",
  active: true,
};

const source: LegalSourceRecord = {
  id: "source:test:one",
  title: "Test Source",
  citation: "Test Source — Official Record",
  sourceType: "official-publications",
  authorityLevel: "primary",
  jurisdiction: {
    countryCode: "IN",
    jurisdictionId: "country:IN",
  },
  authorityId: "court:in:supreme-court",
  authorityName: "Supreme Court of India",
  sourceUrl: "https://example.gov.in/source",
  canonicalUrl: "https://example.gov.in/source",
  availability: "available",
  retrievedAt: new Date("2026-09-16T00:00:00.000Z"),
};

function createRegistries() {
  return {
    jurisdictionRegistry: new InMemoryLegalJurisdictionRegistry([
      jurisdiction,
      jkJurisdiction,
      usJurisdiction,
    ]),
    authorityRegistry: new InMemoryLegalAuthorityRegistry([
      authority,
    ]),
  };
}

describe("legal source registry", () => {
  it("creates a registry from supplied sources", async () => {
    const {
      jurisdictionRegistry,
      authorityRegistry,
    } = createRegistries();

    const registry = await createLegalSourceRegistry(
      [source],
      authorityRegistry,
      jurisdictionRegistry,
    );

    expect(registry.getById("source:test:one")).toEqual(source);
  });

  it("validates authority references", async () => {
    const {
      jurisdictionRegistry,
      authorityRegistry,
    } = createRegistries();

    await expect(
      createLegalSourceRegistry(
        [
          {
            ...source,
            authorityId: "authority:missing",
          },
        ],
        authorityRegistry,
        jurisdictionRegistry,
      ),
    ).rejects.toThrow(
      'references unknown authority "authority:missing"',
    );
  });

  it("validates jurisdiction references", async () => {
    const {
      jurisdictionRegistry,
      authorityRegistry,
    } = createRegistries();

    await expect(
      createLegalSourceRegistry(
        [
          {
            ...source,
            jurisdiction: {
              countryCode: "IN",
              jurisdictionId: "IN-MISSING",
            },
          },
        ],
        authorityRegistry,
        jurisdictionRegistry,
      ),
    ).rejects.toThrow(
      'references unknown jurisdiction "IN-MISSING"',
    );
  });

  it("rejects authority and source jurisdiction mismatch", async () => {
    const {
      jurisdictionRegistry,
      authorityRegistry,
    } = createRegistries();

    await expect(
      createLegalSourceRegistry(
        [
          {
            ...source,
            jurisdiction: {
              countryCode: "IN",
              jurisdictionId: "IN-JK",
            },
          },
        ],
        authorityRegistry,
        jurisdictionRegistry,
      ),
    ).rejects.toThrow(
      'does not match authority "court:in:supreme-court"',
    );
  });

  it("rejects authority and source country mismatch", async () => {
    const {
      jurisdictionRegistry,
      authorityRegistry,
    } = createRegistries();

    await expect(
      createLegalSourceRegistry(
        [
          {
            ...source,
            jurisdiction: {
              countryCode: "US",
              jurisdictionId: "country:US",
            },
          },
        ],
        authorityRegistry,
        jurisdictionRegistry,
      ),
    ).rejects.toThrow(
      'does not match authority "court:in:supreme-court"',
    );
  });

  it("rejects jurisdiction and country mismatch", async () => {
    const {
      jurisdictionRegistry,
      authorityRegistry,
    } = createRegistries();

    await expect(
      createLegalSourceRegistry(
        [
          {
            ...source,
            jurisdiction: {
              countryCode: "US",
              jurisdictionId: "country:IN",
            },
          },
        ],
        authorityRegistry,
        jurisdictionRegistry,
      ),
    ).rejects.toThrow(
      'does not match jurisdiction "country:IN"',
    );
  });

  it("creates the canonical source registry", async () => {
    const registry = await createLegalSourceRegistry();

    expect(registry.getById("portal:in:supreme-court")).toBeDefined();
    expect(
      registry.getById("portal:in:jk-ladakh-high-court"),
    ).toBeDefined();
    expect(
      registry.getById("portal:in:india-code"),
    ).toBeDefined();
  });

  it("supports registry queries", async () => {
    const {
      jurisdictionRegistry,
      authorityRegistry,
    } = createRegistries();

    const registry = await createLegalSourceRegistry(
      [source],
      authorityRegistry,
      jurisdictionRegistry,
    );

    expect(
      registry.getByType("official-publications"),
    ).toHaveLength(1);

    expect(
      registry.getByAuthority("court:in:supreme-court"),
    ).toHaveLength(1);

    expect(
      registry.getByJurisdiction({
        countryCode: "IN",
        jurisdictionId: "country:IN",
      }),
    ).toHaveLength(1);
  });
});
