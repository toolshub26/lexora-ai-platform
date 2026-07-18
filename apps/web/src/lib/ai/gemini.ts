/**
 * Lexora AI Platform
 * Enterprise Gemini Provider
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

export class GeminiProvider implements AIProviderClient {
  constructor(
    private readonly config: AIProviderConfig,
  ) {
    if (!config.apiKey) {
      throw new AIConfigurationError(
        "Gemini API key is missing.",
      );
    }
  }

  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {
    try {
      const endpoint =
        this.config.baseUrl ??
        `https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent?key=${this.config.apiKey}`;

      const response = await fetch(endpoint, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: request.messages.map(
                (message) => ({
                  text: message.content,
                }),
              ),
            },
          ],

          generationConfig: {
            temperature:
              request.temperature ?? 0.3,

            maxOutputTokens:
              request.maxTokens ?? 4096,
          },
        }),
      });

      if (response.status === 429) {
        throw new AIRateLimitError();
      }

      if (!response.ok) {
        const message =
          await response.text();

        throw new AIProviderError(
          "gemini",
          message,
        );
      }

      const json = await response.json();

          const text =
        json?.candidates?.[0]?.content?.parts
          ?.map(
            (part: { text?: string }) =>
              part.text ?? "",
          )
          .join("") ?? "";

      return {
        id:
          crypto.randomUUID(),

        provider: "gemini",

        model: request.model,

        text,

        usage: {
          promptTokens:
            json?.usageMetadata
              ?.promptTokenCount ?? 0,

          completionTokens:
            json?.usageMetadata
              ?.candidatesTokenCount ?? 0,

          totalTokens:
            json?.usageMetadata
              ?.totalTokenCount ?? 0,
        },

        createdAt:
          new Date().toISOString(),
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
          : "Unknown Gemini request error.",
      );
    }
  }
}

export function createGeminiProvider(
  config: AIProviderConfig,
): GeminiProvider {
  return new GeminiProvider(config);
}
