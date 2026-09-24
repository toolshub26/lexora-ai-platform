import { reportsService } from "@/features/reports/service";

describe("ReportsService", () => {
  it("should have service instance", () => {
    expect(reportsService).toBeDefined();
  });

  it("service should have generateOrganizationReport method", () => {
    expect(typeof reportsService.generateOrganizationReport).toBe("function");
  });



});