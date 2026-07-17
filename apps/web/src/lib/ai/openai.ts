import type {
  AIProviderClient,
  AIProviderConfig,
  AIRequest,
  AIResponse,
} from "./types";

import { AIProviderError } from "./errors";

export class OpenAIProvider implements AIProviderClient {
  constructor(
    private readonly config: AIProviderConfig,
  ) {}

  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {
    throw new AIProviderError(
      "openai",
      "OpenAI provider is not implemented yet.",
    );
  }
}

export function createOpenAIProvider(
  config: AIProviderConfig,
): OpenAIProvider {
  return new OpenAIProvider(config);
}
