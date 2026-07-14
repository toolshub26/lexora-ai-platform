import type { Document } from "./types";

export class DocumentSharingService {
  async shareDocument(
    document: Document,
    email: string,
  ): Promise<void> {
    console.log("Sharing document:", {
      document,
      email,
    });
  }

  async revokeAccess(
    documentId: string,
    email: string,
  ): Promise<void> {
    console.log("Revoking document access:", {
      documentId,
      email,
    });
  }

  async getSharedUsers(
    documentId: string,
  ): Promise<string[]> {
    console.log("Loading shared users:", documentId);
    return [];
  }
}

export const documentSharingService =
  new DocumentSharingService();
