"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  loadLegalSourceDataset,
  loadLegalSources,
  validateLegalSourceDataset,
} = require("./source-loader");

test("loads the canonical legal source dataset", () => {
  const dataset = loadLegalSourceDataset();

  assert.equal(dataset.schemaVersion, "1.0.0");
  assert.equal(
    dataset.source.name,
    "official-government-and-court-portals",
  );
  assert.equal(dataset.sources.length, 3);
});

test("loads the canonical source IDs", () => {
  const sources = loadLegalSources();

  assert.deepEqual(
    sources.map((source) => source.id),
    [
      "portal:in:supreme-court",
      "portal:in:jk-ladakh-high-court",
      "portal:in:india-code",
    ],
  );
});

test("preserves the canonical India Code source without an authorityId", () => {
  const source = loadLegalSources().find(
    (item) => item.id === "portal:in:india-code",
  );

  assert.notEqual(source, undefined);
  assert.equal(source.title, "India Code");
  assert.equal(source.sourceType, "official-publications");
  assert.equal(source.authorityLevel, "primary");
  assert.equal(source.authorityId, undefined);
  assert.deepEqual(source.jurisdiction, {
    countryCode: "IN",
    jurisdictionId: "country:IN",
  });
});

test("normalizes dataset dates to Date objects", () => {
  const sources = loadLegalSources();

  for (const source of sources) {
    assert.ok(source.retrievedAt instanceof Date);
  }
});

test("returns independent source arrays", () => {
  const first = loadLegalSources();
  const second = loadLegalSources();

  assert.notEqual(first, second);
  assert.notEqual(first[0], second[0]);
  assert.notEqual(first[0].jurisdiction, second[0].jurisdiction);
});

test("rejects duplicate source IDs", () => {
  assert.throws(
    () =>
      validateLegalSourceDataset({
        schemaVersion: "1.0.0",
        source: {
          name: "test",
          version: "1.0.0",
          standard: "test",
        },
        generatedAt: "2026-09-16T00:00:00.000Z",
        sources: [
          {
            id: "duplicate",
            title: "Source One",
            citation: "Citation One",
            sourceType: "cases",
            authorityLevel: "primary",
            availability: "available",
            retrievedAt: "2026-09-16T00:00:00.000Z",
          },
          {
            id: "duplicate",
            title: "Source Two",
            citation: "Citation Two",
            sourceType: "cases",
            authorityLevel: "primary",
            availability: "available",
            retrievedAt: "2026-09-16T00:00:00.000Z",
          },
        ],
      }),
    /duplicate/i,
  );
});
