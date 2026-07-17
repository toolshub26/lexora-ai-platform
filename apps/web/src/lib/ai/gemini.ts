import type {
  AIProviderClient,
  AIProviderConfig,
  AIRequest,
  AIResponse,
} from "./types";

import { AIProviderError } from "./errors";

export class GeminiProvider implements AIProviderClient {
  constructor(
    private readonly config: AIProviderConfig,
  ) {}

  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {
    throw new AIProviderError(
      "gemini",
      "Gemini provider is not implemented yet.",
    );
  }
}

export function createGeminiProvider(
  config: AIProviderConfig,
): GeminiProvider {
  return new GeminiProvider(config);
}
