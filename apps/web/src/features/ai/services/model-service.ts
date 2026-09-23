import type { AIModel } from "@/lib/ai";
import type { AIProviderType } from "../types/provider";
import { aiProviders } from "@/lib/ai";

export class ModelService {
  private provider: AIProviderType = "gemini";

  setProvider(provider: AIProviderType): void {
    this.provider = provider;
    aiProviders.register(provider, this._getProviderClient());
  }

  getProvider(): AIProviderType {
    return this.provider;
  }

  getAvailableModels(): AIModel[] {
    switch (this.provider) {
      case "openai":
        return ["gpt-4.1", "gpt-4o", "gpt-4o-mini", "gpt-5"];

      case "gemini":
        return ["gemini-2.5-pro", "gemini-2.5-flash"];

      case "claude":
        return ["claude-4-sonnet"];

      case "grok":
        return ["grok-4"];

      case "deepseek":
        return ["deepseek-chat"];

      default:
        return [];
    }
  }

  private _getProviderClient(): any {
    return {
      generate: async () => null,
    };
  }
}

export const modelService = new ModelService();
