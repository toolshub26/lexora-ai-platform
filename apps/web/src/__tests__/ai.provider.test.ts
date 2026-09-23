import { aiProviders } from "@/lib/ai";
import { modelService } from "@/features/ai/services/model-service";
import { providerService } from "@/features/ai/services/provider-service";

describe("AI Provider Architecture", () => {
  it("aiProviders registry exists", () => {
    expect(aiProviders).toBeDefined();
  });

  it("modelService exists", () => {
    expect(modelService).toBeDefined();
  });

  it("providerService exists", () => {
    expect(providerService).toBeDefined();
  });

  it("modelService has default provider", () => {
    expect(modelService.getProvider()).toBeDefined();
  });

  it("providerService can set and get provider", () => {
    providerService.setProvider("openai");
    expect(providerService.getProvider()).toBe("openai");
  });

  it("modelService available models list", () => {
    const models = modelService.getAvailableModels();
    expect(models).toBeInstanceOf(Array);
    expect(models.length).toBeGreaterThan(0);
  });

  it("aiProviders has list method", () => {
    const providers = aiProviders.list();
    expect(providers).toBeInstanceOf(Array);
  });
});