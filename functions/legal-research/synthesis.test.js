"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalSynthesisProvider,
} = require("./synthesis");

test("requires a synthesis generator", () => {
  assert.throws(
    () => new ServerLegalSynthesisProvider(),
    /valid legal synthesis generator/,
  );
});

test("synthesizes using only verified sources and evidence", async () => {
  let receivedInput;

  const provider = new ServerLegalSynthesisProvider({
    generate: async (input) => {
      receivedInput = input;

      return {
        summary: "Verified legal synthesis.",
        citationIds: ["verified-source"],
      };
    },
  });

  const result = await provider.synthesize({
    query: "Limitation period",
    sources: [
      {
        id: "verified-source",
        title: "Verified Case",
        citation: "Verified Citation",
        sourceType: "cases",
        authorityLevel: "primary",
        availability: "available",
        retrievedAt: new Date(),
      },
      {
        id: "unverified-source",
        title: "Unverified Case",
        citation: "Unverified Citation",
        sourceType: "cases",
        authorityLevel: "primary",
        availability: "available",
        retrievedAt: new Date(),
      },
    ],
    evidence: [
      {
        id: "verified-evidence",
        sourceId: "verified-source",
        kind: "full-text",
        excerpt: "Verified evidence.",
        retrievedAt: new Date(),
      },
      {
        id: "unverified-evidence",
        sourceId: "unverified-source",
        kind: "full-text",
        excerpt: "Unverified evidence.",
        retrievedAt: new Date(),
      },
    ],
    verifications: [
      {
        sourceId: "verified-source",
        status: "verified",
        authorityConfirmed: true,
        jurisdictionConfirmed: true,
      },
      {
        sourceId: "unverified-source",
        status: "unverified",
        authorityConfirmed: false,
        jurisdictionConfirmed: false,
      },
    ],
    citations: [
      {
        sourceId: "verified-source",
        citation: "Verified Citation",
        verificationStatus: "verified",
      },
      {
        sourceId: "unverified-source",
        citation: "Unverified Citation",
        verificationStatus: "unverified",
      },
    ],
  });

  assert.deepEqual(
    receivedInput.sources.map((source) => source.id),
    ["verified-source"],
  );

  assert.deepEqual(
    receivedInput.evidence.map((item) => item.id),
    ["verified-evidence"],
  );

  assert.deepEqual(
    receivedInput.verifications.map((item) => item.sourceId),
    ["verified-source"],
  );

  assert.deepEqual(
    receivedInput.citations.map((item) => item.sourceId),
    ["verified-source"],
  );

  assert.deepEqual(result, {
    summary: "Verified legal synthesis.",
    citationIds: ["verified-source"],
  });
});

test("does not synthesize when no verified evidence exists", async () => {
  let generateCalled = false;

  const provider = new ServerLegalSynthesisProvider({
    generate: async () => {
      generateCalled = true;

      return {
        summary: "This must not be returned.",
        citationIds: [],
      };
    },
  });

  const result = await provider.synthesize({
    query: "Unverified legal research",
    sources: [
      {
        id: "unverified-source",
        title: "Unverified Case",
        citation: "Unverified Citation",
        sourceType: "cases",
        authorityLevel: "primary",
        availability: "available",
        retrievedAt: new Date(),
      },
    ],
    evidence: [
      {
        id: "unverified-evidence",
        sourceId: "unverified-source",
        kind: "full-text",
        excerpt: "Unverified evidence.",
        retrievedAt: new Date(),
      },
    ],
    verifications: [
      {
        sourceId: "unverified-source",
        status: "unverified",
        authorityConfirmed: false,
        jurisdictionConfirmed: false,
      },
    ],
    citations: [],
  });

  assert.equal(generateCalled, false);

  assert.deepEqual(result, {
    summary: "No verified legal evidence is available for synthesis.",
    citationIds: [],
  });
});

test("fails closed when synthesis input is missing", async () => {
  let generateCalled = false;

  const provider = new ServerLegalSynthesisProvider({
    generate: async () => {
      generateCalled = true;

      return {
        summary: "Unexpected synthesis.",
        citationIds: [],
      };
    },
  });

  const result = await provider.synthesize();

  assert.equal(generateCalled, false);

  assert.deepEqual(result, {
    summary: "No verified legal evidence is available for synthesis.",
    citationIds: [],
  });
});
