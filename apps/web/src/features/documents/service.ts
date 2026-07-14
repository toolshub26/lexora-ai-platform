import type {
  Document,
  DocumentHistory,
  DocumentSearchResult,
  DocumentTemplate,
} from "./types";

export class DocumentService {
  async getDocuments(): Promise<Document[]> {
    console.log("Loading documents");
    return [];
  }

  async getDocument(
    documentId: string,
  ): Promise<Document | null> {
    console.log("Loading document:", documentId);
    return null;
  }

  async getTemplates(): Promise<DocumentTemplate[]> {
    console.log("Loading document templates");
    return [];
  }

  async search(
    query: string,
  ): Promise<DocumentSearchResult[]> {
    console.log("Searching documents:", query);
    return [];
  }

  async getHistory(
    documentId: string,
  ): Promise<DocumentHistory[]> {
    console.log("Loading document history:", documentId);
    return [];
  }
}

export const documentService = new DocumentService();
