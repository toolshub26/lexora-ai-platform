"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  createGeminiLegalSynthesisModel,
} = require("./gemini-client");

test("requires a Gemini API key", () => {
  assert.throws(
    () =>
      createGeminiLegalSynthesisModel({
        apiKey: "",
      }),
    /Gemini API key is required/,
  );
});

test("creates a Gemini synthesis model with the configured model name", () => {
  const model = createGeminiLegalSynthesisModel({
    apiKey: "test-api-key",
    modelName: "gemini-2.5-flash",
    GoogleGenAI: class {
      constructor(options) {
        assert.equal(options.apiKey, "test-api-key");

        this.models = {
          generateContent: async () => ({
            text: "{}",
          }),
        };
      }
    },
  });

  assert.equal(typeof model.generateContent, "function");
});

test("forwards synthesis requests to Gemini", async () => {
  let received;

  const model = createGeminiLegalSynthesisModel({
    apiKey: "test-api-key",
    modelName: "gemini-2.5-flash",
    GoogleGenAI: class {
      constructor() {
        this.models = {
          generateContent: async (request) => {
            received = request;

            return {
              text: '{"summary":"Verified result.","citationIds":["source-1"]}',
            };
          },
        };
      }
    },
  });

  const response = await model.generateContent({
    contents: "Test verified legal evidence",
  });

  assert.equal(
    received.model,
    "gemini-2.5-flash",
  );

  assert.equal(
    received.contents,
    "Test verified legal evidence",
  );

  assert.equal(
    response.text,
    '{"summary":"Verified result.","citationIds":["source-1"]}',
  );
});
