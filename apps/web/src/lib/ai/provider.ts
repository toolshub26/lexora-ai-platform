
import type {
  AIProvider,
  AIProviderClient,
} from "./types";

export class AIProviderRegistry {
  private readonly providers = new Map<
    AIProvider,
    AIProviderClient
  >();

  register(
    provider: AIProvider,
    client: AIProviderClient,
  ): void {
    this.providers.set(provider, client);
  }

  has(provider: AIProvider): boolean {
    return this.providers.has(provider);
  }

  get(provider: AIProvider): AIProviderClient {
    const client = this.providers.get(provider);

    if (!client) {
      throw new Error(
        `AI provider "${provider}" is not registered.`,
      );
    }

    return client;
  }

  list(): AIProvider[] {
    return [...this.providers.keys()];
  }

  clear(): void {
    this.providers.clear();
  }
}

export const aiProviders =
  new AIProviderRegistry();
