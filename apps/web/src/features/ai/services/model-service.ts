import type { AIProviderType } from "../types/provider";

export class ModelService {
  private provider: AIProviderType = "openai";

  setProvider(provider: AIProviderType) {
    this.provider = provider;
  }

  getProvider(): AIProviderType {
    return this.provider;
  }

  getAvailableModels(): AIProviderType[] {
    return [
      "openai",
      "claude",
      "gemini",
      "grok",
      "deepseek",
    ];
  }
}

export const modelService = new ModelService();
