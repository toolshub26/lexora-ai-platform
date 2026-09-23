import {
  aiProviders,
  type AIProvider,
  type AIProviderConfig,
  type AIRequest,
  type AIResponse,
} from "../lib/ai";

export class AIOrchestrator {
  constructor(
    private readonly configs: Partial<
      Record<AIProvider, AIProviderConfig>
    >,
  ) {
    this.initialize();
  }

  private initialize(): void {
    if (this.configs.openai) {
      aiProviders.register(
        "openai",
        {
          generate: async () => {
            throw new Error(
              "OpenAI provider is server-side only. Use the Lexora AI Cloud Function for AI generation.",
            );
          },
        },
      );
    }

    if (this.configs.gemini) {
      aiProviders.register(
        "gemini",
        {
          generate: async () => {
            throw new Error(
              "Gemini provider generation through orchestrator is not direct. Use the Lexora AI Cloud Function.",
            );
          },
        },
      );
    }
  }

  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {
    const provider = aiProviders.get(request.provider);

    return provider.generate(request);
  }

  providers(): AIProvider[] {
    return aiProviders.list();
  }
}

export default AIOrchestrator;