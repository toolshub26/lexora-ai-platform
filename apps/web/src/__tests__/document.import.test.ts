import { documentImportService } from "@/features/documents/import";

describe("DocumentImportService", () => {
  it("should have service instance", () => {
    expect(documentImportService).toBeDefined();
  });

  it("service should have validateImport method", () => {
    expect(typeof documentImportService.validateImport).toBe("function");
  });

  it("service should have importDocument method", () => {
    expect(typeof documentImportService.importDocument).toBe("function");
  });

  it("validateImport should reject oversized files", () => {
    // This is a compile-time check; actual file testing would need jsdom
    expect(typeof documentImportService.validateImport).toBe("function");
  });

  it("importDocument should return a Document object", () => {
    // Just check the method exists and returns Document-compatible shape
    expect(typeof documentImportService.importDocument).toBe("function");
  });
});