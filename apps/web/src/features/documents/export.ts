import type { Document } from "./types";
import {
  SUPPORTED_EXPORT_FORMATS,
} from "./constants";

export type ExportFormat =
  (typeof SUPPORTED_EXPORT_FORMATS)[number];

export class DocumentExportService {
  /**
   * Validate export format
   */
  async validateExport(
    format: string,
  ): Promise<boolean> {
    if (
      !SUPPORTED_EXPORT_FORMATS.includes(
        format as ExportFormat,
      )
    ) {
      throw new Error(
        `Unsupported export format: ${format}`,
      );
    }

    return true;
  }

  /**
   * Export document
   */
  async exportDocument(
    document: Document,
    format: ExportFormat,
  ): Promise<Blob> {
    await this.validateExport(format);

    console.log(
      `Exporting "${document.title}" as ${format}`,
    );

    let content = "";

    switch (format) {
      case "txt":
        content =
          `Title: ${document.title}\n` +
          `Type: ${document.type}\n` +
          `Status: ${document.status}\n`;
        break;

      case "docx":
      case "pdf":
        // TODO:
        // Integrate DOCX/PDF generator
        content = JSON.stringify(document, null, 2);
        break;

      default:
        throw new Error("Unsupported export format.");
    }

    return new Blob([content], {
      type: "text/plain",
    });
  }

  /**
   * Download exported file
   */
  downloadFile(
    blob: Blob,
    filename: string,
  ): void {
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename;

    document.body.appendChild(link);
    link.click();

    link.remove();
    URL.revokeObjectURL(url);
  }
}

export const documentExportService =
  new DocumentExportService();
