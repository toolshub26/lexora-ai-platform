/**
 * Lexora AI Platform
 * Enterprise OpenAI Provider
 *
 * Note: This provider is configured server-side only.
 * Client-side usage routes through Cloud Functions.
 */

import type {
  AIProviderClient,
  AIProviderConfig,
  AIRequest,
  AIResponse,
} from "./types";

import {
  AIConfigurationError,
  AIProviderError,
  AIRateLimitError,
  AIRequestError,
} from "./errors";

export class OpenAIProvider implements AIProviderClient {
  constructor(
    private readonly config: AIProviderConfig,
  ) {
    if (!config.apiKey) {
      throw new AIConfigurationError(
        "OpenAI API key is missing. Use the server-side AI service.",
      );
    }
  }

  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {
    throw new Error(
      "OpenAI provider is server-side only. Use the Lexora AI Cloud Function for AI generation.",
    );
  }
}

export function createOpenAIProvider(
  config: AIProviderConfig,
): OpenAIProvider {
  return new OpenAIProvider(config);
}
