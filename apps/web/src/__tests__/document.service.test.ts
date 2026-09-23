import { documentService } from "@/features/documents/service";

describe("DocumentService", () => {
  it("should have service instance", () => {
    expect(documentService).toBeDefined();
  });

  it("service should have create method", () => {
    expect(typeof documentService.create).toBe("function");
  });

  it("service should have getDocuments method", () => {
    expect(typeof documentService.getDocuments).toBe("function");
  });

  it("service should have getDocument method", () => {
    expect(typeof documentService.getDocument).toBe("function");
  });

  it("service should have update method", () => {
    expect(typeof documentService.update).toBe("function");
  });

  it("service should have remove method", () => {
    expect(typeof documentService.remove).toBe("function");
  });
});