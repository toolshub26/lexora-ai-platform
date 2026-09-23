"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalJurisdictionRegistry,
} = require("./jurisdiction-registry");

test("gets a jurisdiction by ID", () => {
  const registry = new ServerLegalJurisdictionRegistry([
    {
      id: "country:IN",
      name: "India",
      level: "country",
      countryCode: "IN",
      active: true,
    },
  ]);

  assert.deepEqual(registry.getById("country:IN"), {
    id: "country:IN",
    name: "India",
    level: "country",
    countryCode: "IN",
    active: true,
  });
});

test("returns undefined for an unknown jurisdiction ID", () => {
  const registry = new ServerLegalJurisdictionRegistry([]);

  assert.equal(registry.getById("unknown"), undefined);
});

test("gets child jurisdictions by parent ID", () => {
  const registry = new ServerLegalJurisdictionRegistry([
    {
      id: "country:IN",
      name: "India",
      level: "country",
      countryCode: "IN",
      active: true,
    },
    {
      id: "IN-JK",
      name: "Jammu and Kashmīr",
      level: "other",
      countryCode: "IN",
      parentJurisdictionId: "country:IN",
      active: true,
    },
    {
      id: "IN-MH",
      name: "Maharashtra",
      level: "state",
      countryCode: "IN",
      parentJurisdictionId: "country:IN",
      active: true,
    },
  ]);

  assert.deepEqual(
    registry.getChildren("country:IN").map(
      (jurisdiction) => jurisdiction.id,
    ),
    ["IN-JK", "IN-MH"],
  );
});

test("gets a country by case-insensitive country code", () => {
  const registry = new ServerLegalJurisdictionRegistry([
    {
      id: "country:IN",
      name: "India",
      level: "country",
      countryCode: "IN",
      active: true,
    },
  ]);

  assert.equal(
    registry.getCountry(" in ").id,
    "country:IN",
  );
});

test("does not return non-country jurisdictions from getCountry", () => {
  const registry = new ServerLegalJurisdictionRegistry([
    {
      id: "IN-JK",
      name: "Jammu and Kashmīr",
      level: "other",
      countryCode: "IN",
      parentJurisdictionId: "country:IN",
      active: true,
    },
  ]);

  assert.equal(registry.getCountry("IN"), undefined);
});

test("resolves by jurisdiction ID before country code", () => {
  const registry = new ServerLegalJurisdictionRegistry([
    {
      id: "country:IN",
      name: "India",
      level: "country",
      countryCode: "IN",
      active: true,
    },
    {
      id: "IN-JK",
      name: "Jammu and Kashmīr",
      level: "other",
      countryCode: "IN",
      parentJurisdictionId: "country:IN",
      active: true,
    },
  ]);

  assert.equal(
    registry.resolve({
      jurisdictionId: "IN-JK",
      countryCode: "IN",
    }).id,
    "IN-JK",
  );
});

test("resolves by country code when jurisdiction ID is absent", () => {
  const registry = new ServerLegalJurisdictionRegistry([
    {
      id: "country:IN",
      name: "India",
      level: "country",
      countryCode: "IN",
      active: true,
    },
  ]);

  assert.equal(
    registry.resolve({ countryCode: "in" }).id,
    "country:IN",
  );
});

test("returns undefined when a jurisdiction reference has no usable fields", () => {
  const registry = new ServerLegalJurisdictionRegistry([]);

  assert.equal(registry.resolve({}), undefined);
});

test("rejects duplicate jurisdiction IDs", () => {
  assert.throws(
    () =>
      new ServerLegalJurisdictionRegistry([
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
      ]),
    /Duplicate legal jurisdiction id/,
  );
});

test("canonical registry loads the jurisdiction dataset by default", () => {
  const registry = new ServerLegalJurisdictionRegistry();

  assert.equal(registry.getById("country:IN").name, "India");
  assert.equal(
    registry.getById("IN-JK").parentJurisdictionId,
    "country:IN",
  );
});
