import { contractService } from "@/features/contracts/service";

describe("ContractService", () => {
  it("should have service instance", () => {
    expect(contractService).toBeDefined();
  });

  it("service should have create method", () => {
    expect(typeof contractService.create).toBe("function");
  });

  it("service should have getContracts method", () => {
    expect(typeof contractService.getContracts).toBe("function");
  });

  it("service should have getContract method", () => {
    expect(typeof contractService.getContract).toBe("function");
  });

  it("service should have update method", () => {
    expect(typeof contractService.update).toBe("function");
  });

  it("service should have remove method", () => {
    expect(typeof contractService.remove).toBe("function");
  });

  it("service should have getContractSummary method", () => {
    expect(typeof contractService.getContractSummary).toBe("function");
  });
});
