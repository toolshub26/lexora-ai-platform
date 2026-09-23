import { describe, expect, it } from "vitest";
import {
  loadLegalSources,
  loadLegalSourcesFromDataset,
  validateLegalSourceDataset,
} from "./source-loader";

const validSource = {
  id: "source:test:one",
  title: "Test Legal Source",
  citation: "Test Legal Source — Official Record",
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
  retrievedAt: "2026-09-16T00:00:00.000Z",
};

const validDataset = {
  schemaVersion: "1.0.0",
  source: {
    name: "test-source",
    version: "1.0.0",
    standard: "Lexora Legal Source Dataset",
  },
  generatedAt: "2026-09-16T00:00:00.000Z",
  sources: [validSource],
};

describe("legal source loader", () => {
  it("validates a valid dataset", () => {
    const result = validateLegalSourceDataset(validDataset);

    expect(result.sources).toHaveLength(1);
    expect(result.sources[0].id).toBe("source:test:one");
    expect(result.sources[0].retrievedAt).toBeInstanceOf(Date);
    expect(result.sources[0].sourceUrl).toBe(
      "https://example.gov.in/source",
    );
  });

  it("rejects a non-object dataset", () => {
    expect(() => validateLegalSourceDataset(null)).toThrow(
      "Legal source dataset must be an object.",
    );
  });

  it("rejects invalid schema version", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        schemaVersion: "",
      }),
    ).toThrow("schemaVersion is invalid");
  });

  it("rejects invalid provenance", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        source: {
          name: "",
          version: "1.0.0",
          standard: "Lexora Legal Source Dataset",
        },
      }),
    ).toThrow("source is invalid");
  });

  it("rejects invalid generatedAt", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        generatedAt: "not-a-date",
      }),
    ).toThrow("generatedAt is invalid");
  });

  it("rejects a non-array sources field", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: {},
      }),
    ).toThrow("sources must be an array");
  });

  it("rejects an invalid source type", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [
          {
            ...validSource,
            sourceType: "not-a-source-type",
          },
        ],
      }),
    ).toThrow("invalid source");
  });

  it("rejects an invalid authority level", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [
          {
            ...validSource,
            authorityLevel: "invalid",
          },
        ],
      }),
    ).toThrow("invalid source");
  });

  it("rejects an invalid availability", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [
          {
            ...validSource,
            availability: "invalid",
          },
        ],
      }),
    ).toThrow("invalid source");
  });

  it("rejects non-HTTPS source URLs", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [
          {
            ...validSource,
            sourceUrl: "http://example.gov.in/source",
          },
        ],
      }),
    ).toThrow("invalid source");
  });

  it("rejects invalid canonical URLs", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [
          {
            ...validSource,
            canonicalUrl: "not-a-url",
          },
        ],
      }),
    ).toThrow("invalid source");
  });

  it("rejects invalid retrievedAt", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [
          {
            ...validSource,
            retrievedAt: "invalid-date",
          },
        ],
      }),
    ).toThrow("invalid source");
  });

  it("rejects an invalid effective date range", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [
          {
            ...validSource,
            effectiveFrom: "2026-09-20T00:00:00.000Z",
            effectiveTo: "2026-09-10T00:00:00.000Z",
          },
        ],
      }),
    ).toThrow("invalid source");
  });

  it("rejects duplicate source IDs", () => {
    expect(() =>
      validateLegalSourceDataset({
        ...validDataset,
        sources: [validSource, {...validSource}],
      }),
    ).toThrow('duplicate source ID "source:test:one"');
  });

  it("loads independent source arrays from a dataset", async () => {
    const first = await loadLegalSourcesFromDataset(validDataset);
    const second = await loadLegalSourcesFromDataset(validDataset);

    expect(first).not.toBe(second);
    expect(first[0]).not.toBe(second[0]);
    expect(first[0].retrievedAt).toBeInstanceOf(Date);
    expect(first[0].jurisdiction).not.toBe(second[0].jurisdiction);
  });

  it("loads the canonical legal source dataset", async () => {
    const sources = await loadLegalSources();

    expect(sources).toHaveLength(3);
    expect(
      sources.map((source) => source.id),
    ).toEqual([
      "portal:in:supreme-court",
      "portal:in:jk-ladakh-high-court",
      "portal:in:india-code",
    ]);

    expect(
      sources.every((source) => source.retrievedAt instanceof Date),
    ).toBe(true);
  });
});
