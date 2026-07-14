import type { Document } from "./types";

export type ExportFormat = "pdf" | "docx" | "txt";

export class DocumentExportService {
  async exportDocument(
    document: Document,
    format: ExportFormat,
  ): Promise<void> {
    console.log("Export document:", {
      document,
      format,
    });
  }
}

export const documentExportService =
  new DocumentExportService();
