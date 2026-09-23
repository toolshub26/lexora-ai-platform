"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalAuthorityRegistry,
} = require("./authority-registry");

const authorities = [
  {
    id: "authority-in-supreme-court",
    name: "Supreme Court of India",
    type: "court",
    countryCode: "IN",
    jurisdictionId: "country:IN",
    officialName: "Supreme Court of India",
    officialUrl: "https://www.sci.gov.in/",
    active: true,
  },
  {
    id: "authority-in-high-court",
    name: "High Court of Jammu and Kashmir and Ladakh",
    type: "court",
    countryCode: "IN",
    jurisdictionId: "IN-JK",
    officialName: "High Court of Jammu and Kashmir and Ladakh",
    officialUrl: "https://hcservices.ecourts.gov.in/",
    active: true,
  },
  {
    id: "authority-us-court",
    name: "Example US Court",
    type: "court",
    countryCode: "US",
    jurisdictionId: "US",
    active: true,
  },
];

test("gets an authority by id", () => {
  const registry = new ServerLegalAuthorityRegistry(authorities);

  assert.equal(
    registry.getById("authority-in-supreme-court")?.name,
    "Supreme Court of India",
  );
});

test("returns undefined for an unknown authority", () => {
  const registry = new ServerLegalAuthorityRegistry(authorities);

  assert.equal(registry.getById("missing"), undefined);
});

test("gets authorities by jurisdiction", () => {
  const registry = new ServerLegalAuthorityRegistry(authorities);

  assert.equal(registry.getByJurisdiction("country:IN").length, 1);
  assert.equal(registry.getByJurisdiction("IN-JK").length, 1);
});

test("gets authorities by country case-insensitively", () => {
  const registry = new ServerLegalAuthorityRegistry(authorities);

  assert.equal(registry.getByCountry("in").length, 2);
  assert.equal(registry.getByCountry(" IN ").length, 2);
});

test("does not return authorities from another country", () => {
  const registry = new ServerLegalAuthorityRegistry(authorities);

  assert.equal(registry.getByCountry("US").length, 1);
});

test("rejects duplicate authority ids", () => {
  assert.throws(
    () =>
      new ServerLegalAuthorityRegistry([
        authorities[0],
        { ...authorities[1], id: authorities[0].id },
      ]),
    /duplicate/i,
  );
});

test("rejects an invalid authority record", () => {
  assert.throws(
    () =>
      new ServerLegalAuthorityRegistry([
        {
          id: "invalid",
          name: "",
          type: "court",
          countryCode: "IN",
          active: true,
        },
      ]),
    /invalid/i,
  );
});

test("validates jurisdiction references when a jurisdiction registry is supplied", () => {
  const jurisdictionRegistry = {
    getById(id) {
      return id === "country:IN" ? { id: "country:IN" } : undefined;
    },
  };

  assert.doesNotThrow(() =>
    new ServerLegalAuthorityRegistry(
      [authorities[0]],
      jurisdictionRegistry,
    ),
  );

  assert.throws(
    () =>
      new ServerLegalAuthorityRegistry(
        [authorities[1]],
        jurisdictionRegistry,
      ),
    /unknown jurisdiction/i,
  );
});

test("allows an empty registry", () => {
  const registry = new ServerLegalAuthorityRegistry([]);

  assert.deepEqual(registry.getByCountry("IN"), []);
  assert.deepEqual(registry.getByJurisdiction("country:IN"), []);
});

test("loads the canonical legal authority dataset when no authorities are supplied", () => {
  const registry = new ServerLegalAuthorityRegistry();

  assert.equal(
    registry.getById("court:in:supreme-court")?.name,
    "Supreme Court of India",
  );

  assert.equal(
    registry.getById("court:in:jk-ladakh-high-court")?.name,
    "High Court of Jammu and Kashmir and Ladakh",
  );

  assert.equal(registry.getByCountry("IN").length, 2);
});
