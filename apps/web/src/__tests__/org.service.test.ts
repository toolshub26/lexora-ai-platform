import { organizationService } from "@/features/organization/service";

describe("OrganizationService", () => {
  it("should have service instance", () => {
    expect(organizationService).toBeDefined();
  });

  it("service should have createOrganization method", () => {
    expect(typeof organizationService.createOrganization).toBe("function");
  });

  it("service should have getOrganization method", () => {
    expect(typeof organizationService.getOrganization).toBe("function");
  });

  it("service should have getUserOrganizations method", () => {
    expect(typeof organizationService.getUserOrganizations).toBe("function");
  });

  it("service should have getOrganizationContext method", () => {
    expect(typeof organizationService.getOrganizationContext).toBe("function");
  });
});