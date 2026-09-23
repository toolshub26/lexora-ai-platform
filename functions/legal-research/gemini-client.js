"use strict";

const { GoogleGenAI } = require("@google/genai");

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function createGeminiLegalSynthesisModel(options = {}) {
  const apiKey = String(options.apiKey || "").trim();

  if (!apiKey) {
    throw new Error("Gemini API key is required.");
  }

  const GeminiClient = options.GoogleGenAI || GoogleGenAI;
  const modelName =
    String(options.modelName || DEFAULT_GEMINI_MODEL).trim();

  if (!modelName) {
    throw new Error("Gemini model name is required.");
  }

  const client = new GeminiClient({
    apiKey,
  });

  if (
    !client.models ||
    typeof client.models.generateContent !== "function"
  ) {
    throw new Error(
      "Gemini client does not provide models.generateContent.",
    );
  }

  return {
    async generateContent(request = {}) {
      if (
        !request ||
        typeof request.contents !== "string" ||
        !request.contents.trim()
      ) {
        throw new Error("Gemini synthesis contents are required.");
      }

      return client.models.generateContent({
        model: modelName,
        contents: request.contents,
      });
    },
  };
}

module.exports = {
  createGeminiLegalSynthesisModel,
  DEFAULT_GEMINI_MODEL,
};
