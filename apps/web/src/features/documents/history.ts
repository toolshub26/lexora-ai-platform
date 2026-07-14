import type { DocumentHistory } from "./types";

export class DocumentHistoryService {
  async getHistory(
    documentId: string,
  ): Promise<DocumentHistory[]> {
    console.log("Loading document history:", documentId);
    return [];
  }

  async clearHistory(
    documentId: string,
  ): Promise<void> {
    console.log("Clearing document history:", documentId);
  }
}

export const documentHistoryService =
  new DocumentHistoryService();
