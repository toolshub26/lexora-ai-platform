import { complianceService } from "@/features/compliance/service";

describe("ComplianceService", () => {
  it("should have service instance", () => {
    expect(complianceService).toBeDefined();
  });

  it("service should have create method", () => {
    expect(typeof complianceService.create).toBe("function");
  });

  it("service should have getItems method", () => {
    expect(typeof complianceService.getItems).toBe("function");
  });

  it("service should have getItem method", () => {
    expect(typeof complianceService.getItem).toBe("function");
  });

  it("service should have update method", () => {
    expect(typeof complianceService.update).toBe("function");
  });

  it("service should have remove method", () => {
    expect(typeof complianceService.remove).toBe("function");
  });

  it("service should have getSummary method", () => {
    expect(typeof complianceService.getSummary).toBe("function");
  });
});
