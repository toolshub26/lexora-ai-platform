export interface APIKeyConfig {
  provider: string;
  apiKey: string;
}

export class APIKeyManager {
  private readonly keys = new Map<string, string>();

  set(provider: string, apiKey: string): void {
    this.keys.set(provider, apiKey);
  }

  get(provider: string): string | undefined {
    return this.keys.get(provider);
  }

  has(provider: string): boolean {
    return this.keys.has(provider);
  }

  remove(provider: string): boolean {
    return this.keys.delete(provider);
  }

  clear(): void {
    this.keys.clear();
  }
}

export const apiKeyManager = new APIKeyManager();
