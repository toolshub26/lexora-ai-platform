export interface APIKeyConfig {
  provider: string;
  apiKey: string;
  enabled?: boolean;
}

export class APIKeyManager {
  private readonly keys = new Map<string, APIKeyConfig>();

  set(provider: string, apiKey: string, enabled = true): void {
    this.keys.set(provider, {
      provider,
      apiKey,
      enabled,
    });
  }

  get(provider: string): APIKeyConfig | undefined {
    return this.keys.get(provider);
  }

  getKey(provider: string): string | undefined {
    const config = this.keys.get(provider);

    if (!config?.enabled) {
      return undefined;
    }

    return config.apiKey;
  }

  has(provider: string): boolean {
    return this.keys.has(provider);
  }

  enable(provider: string): void {
    const config = this.keys.get(provider);
    if (config) {
      config.enabled = true;
    }
  }

  disable(provider: string): void {
    const config = this.keys.get(provider);
    if (config) {
      config.enabled = false;
    }
  }

  remove(provider: string): boolean {
    return this.keys.delete(provider);
  }

  clear(): void {
    this.keys.clear();
  }

  listProviders(): string[] {
    return [...this.keys.keys()];
  }
}

export const apiKeyManager = new APIKeyManager();
