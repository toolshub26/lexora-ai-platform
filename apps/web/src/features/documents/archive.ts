import type { Document } from "./types";

export class DocumentArchiveService {
  async archiveDocument(
    document: Document,
  ): Promise<Document> {
    console.log("Archiving document:", document);

    return {
      ...document,
      status: "archived",
      updatedAt: new Date(),
    };
  }

  async restoreDocument(
    document: Document,
  ): Promise<Document> {
    console.log("Restoring document:", document);

    return {
      ...document,
      status: "draft",
      updatedAt: new Date(),
    };
  }

  async getArchivedDocuments(): Promise<Document[]> {
    console.log("Loading archived documents");
    return [];
  }
}

export const documentArchiveService =
  new DocumentArchiveService();
