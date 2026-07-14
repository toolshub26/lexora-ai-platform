import type { Document } from "./types";

export class DocumentImportService {
  async importDocument(
    file: File,
  ): Promise<Document | null> {
    console.log("Import document:", file.name);

    return null;
  }

  async validateImport(
    file: File,
  ): Promise<boolean> {
    console.log("Validate imported document:", file.name);

    return true;
  }
}

export const documentImportService =
  new DocumentImportService();
