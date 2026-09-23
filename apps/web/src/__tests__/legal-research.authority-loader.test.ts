import { describe, expect, it } from "vitest";
import {
  validateLegalAuthorityDataset,
} from "../features/legal-research/authority-loader";

describe("legal authority dataset loader", () => {
  const validDataset = {
    schemaVersion: "1.0.0",
    source: {
      name: "test-source",
      version: "1.0.0",
      standard: "Lexora Legal Authority Dataset",
    },
    generatedAt: "2026-09-13T00:00:00.000Z",
    authorities: [
      {
        id: "test:authority",
        name: "Test Authority",
        type: "court",
        countryCode: "XX",
        jurisdictionId: "country:XX",
        active: true,
      },
    ],
  };

  it("accepts a valid authority dataset", () => {
    const dataset = validateLegalAuthorityDataset(validDataset);

    expect(dataset.schemaVersion).toBe("1.0.0");
    expect(dataset.authorities).toHaveLength(1);
  });

  it("rejects a non-object dataset", () => {
    expect(() =>
      validateLegalAuthorityDataset(null),
    ).toThrow(/must be an object/i);
  });

  it("rejects an invalid schema version", () => {
    expect(() =>
      validateLegalAuthorityDataset({
        ...validDataset,
        schemaVersion: "",
      }),
    ).toThrow(/schemaVersion/i);
  });

  it("rejects invalid dataset provenance", () => {
    expect(() =>
      validateLegalAuthorityDataset({
        ...validDataset,
        source: {
          name: "",
          version: "1.0.0",
          standard: "Lexora Legal Authority Dataset",
        },
      }),
    ).toThrow(/source/i);
  });

  it("rejects an invalid generatedAt value", () => {
    expect(() =>
      validateLegalAuthorityDataset({
        ...validDataset,
        generatedAt: "not-a-date",
      }),
    ).toThrow(/generatedAt/i);
  });

  it("rejects a non-array authorities field", () => {
    expect(() =>
      validateLegalAuthorityDataset({
        ...validDataset,
        authorities: {},
      }),
    ).toThrow(/authorities/i);
  });

  it("rejects an invalid authority record", () => {
    expect(() =>
      validateLegalAuthorityDataset({
        ...validDataset,
        authorities: [
          {
            ...validDataset.authorities[0],
            id: "",
          },
        ],
      }),
    ).toThrow(/authority/i);
  });

  it("rejects duplicate authority IDs", () => {
    expect(() =>
      validateLegalAuthorityDataset({
        ...validDataset,
        authorities: [
          validDataset.authorities[0],
          { ...validDataset.authorities[0] },
        ],
      }),
    ).toThrow(/duplicate/i);
  });
});

describe("legal authority parent references", () => {
  const baseAuthority = {
    id: "test:child",
    name: "Child Authority",
    type: "court" as const,
    countryCode: "XX",
    jurisdictionId: "country:XX",
    active: true,
  };

  const baseDataset = {
    schemaVersion: "1.0.0",
    source: {
      name: "test-source",
      version: "1.0.0",
      standard: "Lexora Legal Authority Dataset",
    },
    generatedAt: "2026-09-13T00:00:00.000Z",
    authorities: [],
  };

  it("accepts a valid parent authority reference", () => {
    const dataset = validateLegalAuthorityDataset({
      ...baseDataset,
      authorities: [
        {
          id: "test:parent",
          name: "Parent Authority",
          type: "court" as const,
          countryCode: "XX",
          active: true,
        },
        {
          ...baseAuthority,
          parentAuthorityId: "test:parent",
        },
      ],
    });

    expect(dataset.authorities).toHaveLength(2);
  });

  it("rejects a missing parent authority reference", () => {
    expect(() =>
      validateLegalAuthorityDataset({
        ...baseDataset,
        authorities: [
          {
            ...baseAuthority,
            parentAuthorityId: "test:missing-parent",
          },
        ],
      }),
    ).toThrow(/missing parent/i);
  });
});

describe("legal authority dataset loading", () => {
  const dataset = {
    schemaVersion: "1.0.0",
    source: {
      name: "test-source",
      version: "1.0.0",
      standard: "Lexora Legal Authority Dataset",
    },
    generatedAt: "2026-09-13T00:00:00.000Z",
    authorities: [
      {
        id: "test:authority",
        name: "Test Authority",
        type: "court" as const,
        countryCode: "XX",
        active: true,
      },
    ],
  };

  it("loads authorities from a validated dataset", async () => {
    const { loadLegalAuthoritiesFromDataset } =
      await import("../features/legal-research/authority-loader");

    const authorities =
      await loadLegalAuthoritiesFromDataset(dataset);

    expect(authorities).toHaveLength(1);
    expect(authorities[0]?.id).toBe("test:authority");
  });

  it("returns independent authority arrays", async () => {
    const { loadLegalAuthoritiesFromDataset } =
      await import("../features/legal-research/authority-loader");

    const first =
      await loadLegalAuthoritiesFromDataset(dataset);
    const second =
      await loadLegalAuthoritiesFromDataset(dataset);

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});

describe("canonical legal authority loader", () => {
  it("exports a canonical dataset loader", async () => {
    const authorityLoaderModule = await import(
      "../features/legal-research/authority-loader"
    );

    expect(typeof authorityLoaderModule.loadLegalAuthorities).toBe("function");
  });
});

describe("canonical India legal authorities", () => {
  it("loads the canonical India authority records", async () => {
    const { loadLegalAuthorities } = await import(
      "../features/legal-research/authority-loader"
    );

    const authorities = await loadLegalAuthorities();

    expect(authorities).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "court:in:supreme-court",
          name: "Supreme Court of India",
          type: "court",
          countryCode: "IN",
          jurisdictionId: "country:IN",
          officialUrl: "https://www.sci.gov.in/",
          active: true,
        }),
        expect.objectContaining({
          id: "court:in:jk-ladakh-high-court",
          name: "High Court of Jammu and Kashmir and Ladakh",
          type: "court",
          countryCode: "IN",
          jurisdictionId: "IN-JK",
          officialUrl: "https://hcservices.ecourts.gov.in/",
          active: true,
        }),
      ]),
    );
  });
});
