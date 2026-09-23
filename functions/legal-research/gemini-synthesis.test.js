"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createGeminiLegalSynthesisGenerator,
} = require("./gemini-synthesis");

test("requires a Gemini model client", () => {
  assert.throws(
    () => createGeminiLegalSynthesisGenerator({}),
    /Gemini model client is required/,
  );
});

test("generates a legal synthesis from verified evidence", async () => {
  const calls = [];

  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async (request) => {
        calls.push(request);

        return {
          text: JSON.stringify({
            summary: "The verified legal materials indicate the stated rule.",
            citationIds: ["portal:in:supreme-court"],
          }),
        };
      },
    },
  });

  const result = await generator({
    query: "What is the applicable legal rule?",
    sources: [
      {
        id: "portal:in:supreme-court",
        title: "Supreme Court of India",
        citation: "Supreme Court of India",
      },
    ],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "portal:in:supreme-court",
        kind: "full-text",
        excerpt: "Verified legal text.",
      },
    ],
    verifications: [
      {
        sourceId: "portal:in:supreme-court",
        status: "verified",
      },
    ],
    citations: [
      {
        sourceId: "portal:in:supreme-court",
        citation: "Supreme Court of India",
        verificationStatus: "verified",
      },
    ],
  });

  assert.equal(
    result.summary,
    "The verified legal materials indicate the stated rule.",
  );

  assert.deepEqual(
    result.citationIds,
    ["portal:in:supreme-court"],
  );

  assert.equal(calls.length, 1);
  assert.match(calls[0].contents, /What is the applicable legal rule/);
  assert.match(calls[0].contents, /Verified legal text/);
});

test("rejects synthesis input containing unverified evidence", async () => {
  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async () => ({
        text: JSON.stringify({
          summary: "Should not run.",
          citationIds: [],
        }),
      }),
    },
  });

  await assert.rejects(
    () =>
      generator({
        query: "Test",
        sources: [
          {
            id: "source-1",
            title: "Unverified source",
          },
        ],
        evidence: [
          {
            id: "evidence-1",
            sourceId: "source-1",
            excerpt: "Unverified evidence",
          },
        ],
        verifications: [
          {
            sourceId: "source-1",
            status: "unverified",
          },
        ],
        citations: [],
      }),
    /verified legal evidence/i,
  );
});

test("supports the fallback Gemini response.text() shape", async () => {
  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async () => ({
        response: {
          text: () =>
            JSON.stringify({
              summary: "Fallback response synthesis.",
              citationIds: ["source-1"],
            }),
        },
      }),
    },
  });

  const result = await generator({
    query: "Test fallback response",
    sources: [
      {
        id: "source-1",
        title: "Verified Source",
        citation: "Verified Citation",
      },
    ],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        excerpt: "Verified evidence.",
      },
    ],
    verifications: [
      {
        sourceId: "source-1",
        status: "verified",
      },
    ],
    citations: [
      {
        sourceId: "source-1",
        citation: "Verified Citation",
        verificationStatus: "verified",
      },
    ],
  });

  assert.deepEqual(result, {
    summary: "Fallback response synthesis.",
    citationIds: ["source-1"],
  });
});

test("rejects an empty Gemini response", async () => {
  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async () => ({
        text: "   ",
      }),
    },
  });

  await assert.rejects(
    () =>
      generator({
        query: "Test",
        sources: [
          {
            id: "source-1",
            title: "Verified Source",
            citation: "Verified Citation",
          },
        ],
        evidence: [
          {
            id: "evidence-1",
            sourceId: "source-1",
            excerpt: "Verified evidence.",
          },
        ],
        verifications: [
          {
            sourceId: "source-1",
            status: "verified",
          },
        ],
        citations: [
          {
            sourceId: "source-1",
            citation: "Verified Citation",
            verificationStatus: "verified",
          },
        ],
      }),
    /empty response/i,
  );
});

test("rejects invalid Gemini JSON", async () => {
  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async () => ({
        text: "not valid json",
      }),
    },
  });

  await assert.rejects(
    () =>
      generator({
        query: "Test",
        sources: [
          {
            id: "source-1",
            title: "Verified Source",
            citation: "Verified Citation",
          },
        ],
        evidence: [
          {
            id: "evidence-1",
            sourceId: "source-1",
            excerpt: "Verified evidence.",
          },
        ],
        verifications: [
          {
            sourceId: "source-1",
            status: "verified",
          },
        ],
        citations: [
          {
            sourceId: "source-1",
            citation: "Verified Citation",
            verificationStatus: "verified",
          },
        ],
      }),
    /invalid JSON/i,
  );
});

test("rejects an invalid Gemini synthesis result", async () => {
  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async () => ({
        text: JSON.stringify({
          citationIds: ["source-1"],
        }),
      }),
    },
  });

  await assert.rejects(
    () =>
      generator({
        query: "Test",
        sources: [
          {
            id: "source-1",
            title: "Verified Source",
            citation: "Verified Citation",
          },
        ],
        evidence: [
          {
            id: "evidence-1",
            sourceId: "source-1",
            excerpt: "Verified evidence.",
          },
        ],
        verifications: [
          {
            sourceId: "source-1",
            status: "verified",
          },
        ],
        citations: [
          {
            sourceId: "source-1",
            citation: "Verified Citation",
            verificationStatus: "verified",
          },
        ],
      }),
    /invalid result/i,
  );
});

test("filters citation IDs that are not verified source IDs", async () => {
  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async () => ({
        text: JSON.stringify({
          summary: "Verified synthesis.",
          citationIds: [
            "source-1",
            "unverified-source",
            "unknown-source",
          ],
        }),
      }),
    },
  });

  const result = await generator({
    query: "Test citation filtering",
    sources: [
      {
        id: "source-1",
        title: "Verified Source",
        citation: "Verified Citation",
      },
      {
        id: "unverified-source",
        title: "Unverified Source",
        citation: "Unverified Citation",
      },
    ],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        excerpt: "Verified evidence.",
      },
    ],
    verifications: [
      {
        sourceId: "source-1",
        status: "verified",
      },
      {
        sourceId: "unverified-source",
        status: "unverified",
      },
    ],
    citations: [
      {
        sourceId: "source-1",
        citation: "Verified Citation",
        verificationStatus: "verified",
      },
    ],
  });

  assert.deepEqual(result.citationIds, ["source-1"]);
});

test("propagates Gemini generation failures", async () => {
  const generator = createGeminiLegalSynthesisGenerator({
    model: {
      generateContent: async () => {
        throw new Error("Synthetic Gemini failure");
      },
    },
  });

  await assert.rejects(
    () =>
      generator({
        query: "Test Gemini failure",
        sources: [
          {
            id: "source-1",
            title: "Verified Source",
            citation: "Verified Citation",
          },
        ],
        evidence: [
          {
            id: "evidence-1",
            sourceId: "source-1",
            excerpt: "Verified evidence.",
          },
        ],
        verifications: [
          {
            sourceId: "source-1",
            status: "verified",
          },
        ],
        citations: [
          {
            sourceId: "source-1",
            citation: "Verified Citation",
            verificationStatus: "verified",
          },
        ],
      }),
    /Synthetic Gemini failure/i,
  );
});
