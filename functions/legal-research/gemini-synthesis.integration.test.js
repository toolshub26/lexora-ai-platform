"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createGeminiLegalSynthesisModel,
} = require("./gemini-client");

const {
  createGeminiLegalSynthesisGenerator,
} = require("./gemini-synthesis");

test("Gemini client and synthesis generator work together", async () => {
  let request;

  const model = createGeminiLegalSynthesisModel({
    apiKey: "test-api-key",
    modelName: "gemini-2.5-flash",
    GoogleGenAI: class {
      constructor(options) {
        assert.equal(options.apiKey, "test-api-key");

        this.models = {
          generateContent: async (input) => {
            request = input;

            return {
              text: JSON.stringify({
                summary:
                  "The verified legal materials indicate the applicable rule.",
                citationIds: ["portal:in:supreme-court"],
              }),
            };
          },
        };
      }
    },
  });

  const generator = createGeminiLegalSynthesisGenerator({
    model,
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
    "The verified legal materials indicate the applicable rule.",
  );

  assert.deepEqual(
    result.citationIds,
    ["portal:in:supreme-court"],
  );

  assert.equal(request.model, "gemini-2.5-flash");
  assert.match(request.contents, /applicable legal rule/i);
  assert.match(request.contents, /Verified legal text/);
});
