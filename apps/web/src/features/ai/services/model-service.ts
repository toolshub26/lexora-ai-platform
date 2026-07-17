import { AIProvider } from "../types/provider";

export class ModelService {
  private provider: AIProvider = "openai";

  setProvider(provider: AIProvider) {
    this.provider = provider;
  }

  getProvider(): AIProvider {
    return this.provider;
  }

  getAvailableModels(): AIProvider[] {
    return ["openai", "claude", "gemini", "grok", "deepseek"];
  }
}

export const modelService = new ModelService();
