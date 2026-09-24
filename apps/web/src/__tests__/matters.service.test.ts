import { matterService } from "@/features/matters/service";

describe("MatterService", () => {
  it("should have service instance", () => {
    expect(matterService).toBeDefined();
  });

  it("service should have create method", () => {
    expect(typeof matterService.create).toBe("function");
  });

  it("service should have getMatters method", () => {
    expect(typeof matterService.getMatters).toBe("function");
  });

  it("service should have getMatter method", () => {
    expect(typeof matterService.getMatter).toBe("function");
  });

  it("service should have update method", () => {
    expect(typeof matterService.update).toBe("function");
  });

  it("service should have remove method", () => {
    expect(typeof matterService.remove).toBe("function");
  });

  it("service should have getMatterSummary method", () => {
    expect(typeof matterService.getMatterSummary).toBe("function");
  });
});
