import type { AIProviderType } from "../types/provider";
import { modelService } from "./model-service";

export class ProviderService {
  private provider: AIProviderType | null = null;

  setProvider(provider: AIProviderType) {
    this.provider = provider;
    modelService.setProvider(provider);
  }

  getProvider(): AIProviderType | null {
    return this.provider;
  }

  hasProvider(): boolean {
    return this.provider !== null;
  }

  clearProvider() {
    this.provider = null;
  }
}

export const providerService = new ProviderService();
