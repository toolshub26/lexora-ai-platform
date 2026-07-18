/**
 * Lexora AI Platform
 * Enterprise OpenAI Provider
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
        "OpenAI API key is missing.",
      );
    }
  }

  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {
    try {
      const response = await fetch(
        this.config.baseUrl ??
          "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",

          headers: {
            Authorization: `Bearer ${this.config.apiKey}`,
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            model: request.model,

            messages: request.messages,

            temperature:
              request.temperature ?? 0.3,

            max_tokens:
              request.maxTokens ?? 4096,

            stream:
              request.stream ?? false,
          }),
        },
      );

      if (response.status === 429) {
        throw new AIRateLimitError();
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new AIProviderError(
          "openai",
          message,
        );
      }

      const json = await response.json();

          const content =
        json?.choices?.[0]?.message?.content ?? "";

      return {
        id:
          json?.id ??
          crypto.randomUUID(),

        provider: "openai",

        model: request.model,

        text: content,

        usage: {
          promptTokens:
            json?.usage?.prompt_tokens ?? 0,

          completionTokens:
            json?.usage?.completion_tokens ?? 0,

          totalTokens:
            json?.usage?.total_tokens ?? 0,
        },

        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      if (
        error instanceof AIProviderError ||
        error instanceof AIRateLimitError ||
        error instanceof AIConfigurationError
      ) {
        throw error;
      }

      throw new AIRequestError(
        error instanceof Error
          ? error.message
          : "Unknown OpenAI request error.",
      );
    }
  }
}

export function createOpenAIProvider(
  config: AIProviderConfig,
): OpenAIProvider {
  return new OpenAIProvider(config);
}
