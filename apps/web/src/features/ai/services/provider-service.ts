import type { AIProviderType } from "../types/provider";
import { modelService } from "./model-service";
import { aiProviders } from "@/lib/ai";

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
    aiProviders.clear();
  }
}

export const providerService = new ProviderService();