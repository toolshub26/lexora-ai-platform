"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalSourceRegistry,
} = require("./registry");

const sources = [
  {
    id: "source-in-case",
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
    sourceUrl: "https://example.gov/case",
    canonicalUrl: "https://example.gov/case",
    availability: "available",
    retrievedAt: new Date(),
  },
  {
    id: "source-in-statute",
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
    id: "source-us-secondary",
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

test("gets a source by id", () => {
  const registry = new ServerLegalSourceRegistry(sources);

  assert.equal(
    registry.getById("source-in-case")?.title,
    "Indian Supreme Court Case",
  );
});

test("returns undefined for an unknown source", () => {
  const registry = new ServerLegalSourceRegistry(sources);

  assert.equal(registry.getById("missing"), undefined);
});

test("gets sources by jurisdiction id", () => {
  const registry = new ServerLegalSourceRegistry(sources);

  assert.equal(
    registry.getByJurisdiction({
      jurisdictionId: "india",
    }).length,
    2,
  );
});

test("matches country codes case-insensitively", () => {
  const registry = new ServerLegalSourceRegistry(sources);

  assert.equal(
    registry.getByJurisdiction({
      countryCode: "in",
    }).length,
    2,
  );
});

test("filters by source type", () => {
  const registry = new ServerLegalSourceRegistry(sources);

  assert.equal(registry.getByType("cases").length, 1);
  assert.equal(registry.getByType("statutes").length, 1);
  assert.equal(registry.getByType("secondary").length, 1);
});

test("filters by authority", () => {
  const registry = new ServerLegalSourceRegistry(sources);

  assert.equal(
    registry.getByAuthority("supreme-court-india").length,
    1,
  );
});

test("does not match a different jurisdiction", () => {
  const registry = new ServerLegalSourceRegistry(sources);

  assert.equal(
    registry.getByJurisdiction({
      jurisdictionId: "united-states",
    }).length,
    1,
  );
});

test("rejects duplicate source ids", () => {
  assert.throws(
    () =>
      new ServerLegalSourceRegistry([
        sources[0],
        { ...sources[1], id: sources[0].id },
      ]),
    /duplicate/i,
  );
});

test("rejects an invalid source record", () => {
  assert.throws(
    () =>
      new ServerLegalSourceRegistry([
        {
          id: "invalid",
          title: "",
          citation: "Citation",
          sourceType: "cases",
          authorityLevel: "primary",
          availability: "available",
          retrievedAt: new Date(),
        },
      ]),
    /invalid/i,
  );
});

test("allows an empty registry", () => {
  const registry = new ServerLegalSourceRegistry([]);

  assert.deepEqual(registry.getByType("cases"), []);
  assert.deepEqual(registry.getByAuthority("missing"), []);
  assert.deepEqual(
    registry.getByJurisdiction({
      countryCode: "IN",
    }),
    [],
  );
});

test("loads the canonical legal source dataset when no sources are supplied", () => {
  const registry = new ServerLegalSourceRegistry();

  assert.equal(
    registry.getById("portal:in:supreme-court")?.title,
    "Supreme Court of India",
  );

  assert.equal(
    registry.getById("portal:in:jk-ladakh-high-court")?.title,
    "High Court of Jammu and Kashmir and Ladakh",
  );

  assert.equal(
    registry.getById("portal:in:india-code")?.title,
    "India Code",
  );
});
