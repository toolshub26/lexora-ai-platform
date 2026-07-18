import type { AIProvider } from "../types";
import { modelService } from "./model-service";

export class ProviderService {
  private provider: AIProvider | null = null;

  setProvider(provider: AIProvider) {
    this.provider = provider;
    modelService.setProvider(provider);
  }

  getProvider() {
    return this.provider;
  }

  hasProvider() {
    return this.provider !== null;
  }

  clearProvider() {
    this.provider = null;
  }
}

export const providerService = new ProviderService();
