import type { Document } from "./types";
import {
  MAX_DOCUMENT_SIZE,
  SUPPORTED_EXPORT_FORMATS,
} from "./constants";

export class DocumentImportService {
  /**
   * Validate uploaded document
   */
  async validateImport(file: File): Promise<boolean> {
    // Size validation
    if (file.size > MAX_DOCUMENT_SIZE) {
      throw new Error(
        `Maximum allowed file size is ${
          MAX_DOCUMENT_SIZE / (1024 * 1024)
        } MB.`,
      );
    }

    // Extension validation
    const extension =
      file.name.split(".").pop()?.toLowerCase() || "";

    if (
      !SUPPORTED_EXPORT_FORMATS.includes(
        extension as (typeof SUPPORTED_EXPORT_FORMATS)[number],
      )
    ) {
      throw new Error(
        `Unsupported document format: ${extension}`,
      );
    }

    return true;
  }

  /**
   * Import document
   */
  async importDocument(
    file: File,
  ): Promise<Document> {
    await this.validateImport(file);

    const now = new Date();

    const document: Document = {
      id:
        crypto.randomUUID?.() ??
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      type:
        file.name.split(".").pop()?.toLowerCase() ||
        "unknown",
      status: "draft",
      createdAt: now,
      updatedAt: now,
    };

    console.log("Document imported:", document);

    // TODO:
    // Upload original file to Firebase Storage
    // Save metadata into Firestore
    // Generate search index
    // Create history record

    return document;
  }
}

export const documentImportService =
  new DocumentImportService();
