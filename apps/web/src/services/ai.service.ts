import {
  aiProviders,
  createGeminiProvider,
  createOpenAIProvider,
  type AIRequest,
  type AIResponse,
} from "../lib/ai";

import {
  AI_CONFIG,
  GEMINI_CONFIG,
  OPENAI_CONFIG,
} from "../config/ai";

export class AIService {
  constructor() {
    if (!aiProviders.has("gemini")) {
      aiProviders.register(
        "gemini",
        createGeminiProvider(GEMINI_CONFIG),
      );
    }

    if (!aiProviders.has("openai")) {
      aiProviders.register(
        "openai",
        createOpenAIProvider(OPENAI_CONFIG),
      );
    }
  }

  async generate(
    request: Omit<AIRequest, "provider">,
  ): Promise<AIResponse> {
    const provider =
      aiProviders.get(AI_CONFIG.defaultProvider);

    return provider.generate({
      provider: AI_CONFIG.defaultProvider,
      ...request,
    });
  }
}

export const aiService = new AIService();
