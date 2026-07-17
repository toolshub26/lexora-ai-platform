import { describe, expect, it } from "vitest";
import { AIService } from "../services";

describe("AIService", () => {
  it("should create an AIService instance", () => {
    const service = new AIService();

    expect(service).toBeInstanceOf(AIService);
  });

  it("should return available models", () => {
    const service = new AIService();

    expect(service.getModels().length).toBeGreaterThan(0);
  });

  it("should use openai as default provider", () => {
    const service = new AIService();

    expect(service.getProvider()).toBe("openai");
  });
});
