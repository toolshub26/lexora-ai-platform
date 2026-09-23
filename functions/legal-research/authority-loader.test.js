"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  loadLegalAuthorityDataset,
  loadLegalAuthorities,
  validateLegalAuthorityDataset,
} = require("./authority-loader");

test("loads the canonical legal authority dataset", () => {
  const dataset = loadLegalAuthorityDataset();

  assert.equal(dataset.schemaVersion, "1.0.0");
  assert.equal(dataset.source.name, "official-government-sources");
  assert.equal(dataset.authorities.length, 2);
});

test("loads the canonical authority IDs", () => {
  const authorities = loadLegalAuthorities();

  assert.deepEqual(
    authorities.map((authority) => authority.id),
    [
      "court:in:supreme-court",
      "court:in:jk-ladakh-high-court",
    ],
  );
});

test("preserves canonical authority fields", () => {
  const authorities = loadLegalAuthorities();

  assert.deepEqual(
    {
      id: authorities[0].id,
      name: authorities[0].name,
      type: authorities[0].type,
      countryCode: authorities[0].countryCode,
      jurisdictionId: authorities[0].jurisdictionId,
      officialUrl: authorities[0].officialUrl,
      active: authorities[0].active,
    },
    {
      id: "court:in:supreme-court",
      name: "Supreme Court of India",
      type: "court",
      countryCode: "IN",
      jurisdictionId: "country:IN",
      officialUrl: "https://www.sci.gov.in/",
      active: true,
    },
  );

  assert.deepEqual(
    {
      id: authorities[1].id,
      name: authorities[1].name,
      type: authorities[1].type,
      countryCode: authorities[1].countryCode,
      jurisdictionId: authorities[1].jurisdictionId,
      officialUrl: authorities[1].officialUrl,
      active: authorities[1].active,
    },
    {
      id: "court:in:jk-ladakh-high-court",
      name: "High Court of Jammu and Kashmir and Ladakh",
      type: "court",
      countryCode: "IN",
      jurisdictionId: "IN-JK",
      officialUrl: "https://hcservices.ecourts.gov.in/",
      active: true,
    },
  );
});

test("returns independent authority arrays and records", () => {
  const first = loadLegalAuthorities();
  const second = loadLegalAuthorities();

  assert.notEqual(first, second);
  assert.notEqual(first[0], second[0]);
});

test("rejects duplicate authority IDs", () => {
  assert.throws(
    () =>
      validateLegalAuthorityDataset({
        schemaVersion: "1.0.0",
        source: {
          name: "test",
          version: "1.0.0",
          standard: "test",
        },
        generatedAt: "2026-09-16T00:00:00.000Z",
        authorities: [
          {
            id: "duplicate",
            name: "Authority One",
            type: "court",
            countryCode: "IN",
            active: true,
          },
          {
            id: "duplicate",
            name: "Authority Two",
            type: "court",
            countryCode: "IN",
            active: true,
          },
        ],
      }),
    /duplicate/i,
  );
});

test("rejects an authority with a missing parent authority", () => {
  assert.throws(
    () =>
      validateLegalAuthorityDataset({
        schemaVersion: "1.0.0",
        source: {
          name: "test",
          version: "1.0.0",
          standard: "test",
        },
        generatedAt: "2026-09-16T00:00:00.000Z",
        authorities: [
          {
            id: "child",
            name: "Child Authority",
            type: "court",
            countryCode: "IN",
            parentAuthorityId: "missing-parent",
            active: true,
          },
        ],
      }),
    /missing parent/i,
  );
});

test("rejects non-HTTPS official URLs", () => {
  assert.throws(
    () =>
      validateLegalAuthorityDataset({
        schemaVersion: "1.0.0",
        source: {
          name: "test",
          version: "1.0.0",
          standard: "test",
        },
        generatedAt: "2026-09-16T00:00:00.000Z",
        authorities: [
          {
            id: "authority",
            name: "Test Authority",
            type: "court",
            countryCode: "IN",
            officialUrl: "http://example.com/",
            active: true,
          },
        ],
      }),
    /HTTPS/i,
  );
});

test("rejects credentials in official URLs", () => {
  assert.throws(
    () =>
      validateLegalAuthorityDataset({
        schemaVersion: "1.0.0",
        source: {
          name: "test",
          version: "1.0.0",
          standard: "test",
        },
        generatedAt: "2026-09-16T00:00:00.000Z",
        authorities: [
          {
            id: "authority",
            name: "Test Authority",
            type: "court",
            countryCode: "IN",
            officialUrl: "https://user:pass@example.com/",
            active: true,
          },
        ],
      }),
    /credentials/i,
  );
});
