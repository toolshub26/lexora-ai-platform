import type { Document } from "./types";

export class DocumentDraftService {
  async getDrafts(): Promise<Document[]> {
    console.log("Loading document drafts");
    return [];
  }

  async getDraft(
    draftId: string,
  ): Promise<Document | null> {
    console.log("Loading draft:", draftId);
    return null;
  }

  async saveDraft(
    document: Document,
  ): Promise<void> {
    console.log("Saving draft:", document);
  }

  async deleteDraft(
    draftId: string,
  ): Promise<void> {
    console.log("Deleting draft:", draftId);
  }
}

export const documentDraftService =
  new DocumentDraftService();
