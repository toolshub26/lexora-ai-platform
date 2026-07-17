import { describe, expect, it } from "vitest";

import {
  openAIProvider,
  geminiProvider,
  claudeProvider,
  grokProvider,
  deepSeekProvider,
} from "../providers";

describe("AI Providers", () => {
  it("should create OpenAI provider", () => {
    expect(openAIProvider).toBeDefined();
  });

  it("should create Gemini provider", () => {
    expect(geminiProvider).toBeDefined();
  });

  it("should create Claude provider", () => {
    expect(claudeProvider).toBeDefined();
  });

  it("should create Grok provider", () => {
    expect(grokProvider).toBeDefined();
  });

  it("should create DeepSeek provider", () => {
    expect(deepSeekProvider).toBeDefined();
  });
});
