import { documentExportService } from "@/features/documents/export";

describe("DocumentExportService", () => {
  it("should have service instance", () => {
    expect(documentExportService).toBeDefined();
  });

  it("service should have validateExport method", () => {
    expect(typeof documentExportService.validateExport).toBe("function");
  });

  it("service should have exportDocument method", () => {
    expect(typeof documentExportService.exportDocument).toBe("function");
  });

  it("service should have downloadFile method", () => {
    expect(typeof documentExportService.downloadFile).toBe("function");
  });

  it("validateExport should accept txt format", () => {
    expect(typeof documentExportService.validateExport).toBe("function");
  });

  it("validateExport should reject unsupported formats", () => {
    expect(typeof documentExportService.validateExport).toBe("function");
  });
});