import type {
  AIProviderType,
  AIProviderClient,
} from "./types";

export class AIProviderRegistry {
  private readonly providers = new Map<
    AIProviderType,
    AIProviderClient
  >();

  register(
    provider: AIProviderType,
    client: AIProviderClient,
  ): void {
    this.providers.set(provider, client);
  }

  has(provider: AIProviderType): boolean {
    return this.providers.has(provider);
  }

  get(provider: AIProviderType): AIProviderClient {
    const client = this.providers.get(provider);

    if (!client) {
      throw new Error(
        `AI provider "${provider}" is not registered.`,
      );
    }

    return client;
  }

  list(): AIProviderType[] {
    return [...this.providers.keys()];
  }

  clear(): void {
    this.providers.clear();
  }
}

export const aiProviders = new AIProviderRegistry();
