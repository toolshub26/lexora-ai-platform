import { aiService } from "@/features/ai/services/ai-service";

describe("AIService", () => {
  it("should have service instance", () => {
    expect(aiService).toBeDefined();
  });

  it("service should have sendMessage method", () => {
    expect(typeof aiService.sendMessage).toBe("function");
  });

  it("service should have setProvider method", () => {
    expect(typeof aiService.setProvider).toBe("function");
  });

  it("service should have getProvider method", () => {
    expect(typeof aiService.getProvider).toBe("function");
  });

  it("service should have getModels method", () => {
    expect(typeof aiService.getModels).toBe("function");
  });
});