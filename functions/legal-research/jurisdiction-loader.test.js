"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  loadLegalJurisdictionDataset,
  loadLegalJurisdictions,
  validateLegalJurisdictionDataset,
} = require("./jurisdiction-loader");

test("loads the canonical legal jurisdiction dataset", () => {
  const dataset = loadLegalJurisdictionDataset();

  assert.equal(dataset.schemaVersion, "1.0.0");
  assert.equal(dataset.source.name, "iso-3166");
  assert.equal(dataset.source.packageVersion, "4.4.0");
  assert.equal(dataset.source.standard, "ISO 3166-2");
  assert.equal(dataset.jurisdictions.length, 5319);
});

test("canonical dataset contains India and Jammu and Kashmir", () => {
  const jurisdictions = loadLegalJurisdictions();

  const india = jurisdictions.find(
    (jurisdiction) => jurisdiction.id === "country:IN",
  );

  const jammuAndKashmir = jurisdictions.find(
    (jurisdiction) => jurisdiction.id === "IN-JK",
  );

  assert.deepEqual(india, {
    id: "country:IN",
    name: "India",
    level: "country",
    countryCode: "IN",
    active: true,
  });

  assert.deepEqual(jammuAndKashmir, {
    id: "IN-JK",
    name: "Jammu and Kashmīr",
    level: "other",
    countryCode: "IN",
    parentJurisdictionId: "country:IN",
    active: true,
  });
});

test("loaded jurisdiction records are independent clones", () => {
  const first = loadLegalJurisdictions();
  const second = loadLegalJurisdictions();

  assert.notStrictEqual(first, second);
  assert.notStrictEqual(first[0], second[0]);
});

test("rejects duplicate jurisdiction IDs", () => {
  assert.throws(
    () =>
      validateLegalJurisdictionDataset({
        schemaVersion: "1.0.0",
        source: {
          name: "test",
          packageVersion: "1.0.0",
          standard: "test",
        },
        generatedAt: new Date().toISOString(),
        jurisdictions: [
          {
            id: "country:IN",
            name: "India",
            level: "country",
            countryCode: "IN",
            active: true,
          },
          {
            id: "country:IN",
            name: "Duplicate India",
            level: "country",
            countryCode: "IN",
            active: true,
          },
        ],
      }),
    /Duplicate legal jurisdiction id/,
  );
});

test("rejects a jurisdiction with a missing parent", () => {
  assert.throws(
    () =>
      validateLegalJurisdictionDataset({
        schemaVersion: "1.0.0",
        source: {
          name: "test",
          packageVersion: "1.0.0",
          standard: "test",
        },
        generatedAt: new Date().toISOString(),
        jurisdictions: [
          {
            id: "IN-JK",
            name: "Jammu and Kashmir",
            level: "other",
            countryCode: "IN",
            parentJurisdictionId: "country:IN",
            active: true,
          },
        ],
      }),
    /references missing parent/,
  );
});
