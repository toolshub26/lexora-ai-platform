import {
  aiProviders,
  createGeminiProvider,
  createOpenAIProvider,
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
        createOpenAIProvider(
          this.configs.openai,
        ),
      );
    }

    if (this.configs.gemini) {
      aiProviders.register(
        "gemini",
        createGeminiProvider(
          this.configs.gemini,
        ),
      );
    }
  }

  async generate(
    request: AIRequest,
  ): Promise<AIResponse> {
    const provider =
      aiProviders.get(request.provider);

    return provider.generate(request);
  }

  providers(): AIProvider[] {
    return aiProviders.list();
  }
}

export default AIOrchestrator;
