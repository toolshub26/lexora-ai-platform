import {
  AIRequest,
  AIResponse,
  AIProvider,
} from "../lib/ai";

import {
  aiProviders,
} from "../lib/ai/provider";

export class AIService {
  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {

    const client =
      aiProviders.get(
        request.provider,
      );

    return client.generate(
      request,
    );
  }

  async generateWithFallback(
    request: AIRequest,
    fallback?: AIProvider,
  ): Promise<AIResponse> {

    try {
      return await this.generate(
        request,
      );
    } catch (error) {

      if (!fallback) {
        throw error;
      }
      const retryRequest: AIRequest = {
        ...request,
        provider: fallback,
      };

      return this.generate(
        retryRequest,
      );
    }
  }
}

export const aiService =
  new AIService();

export default aiService;
    
