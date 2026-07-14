import type { DocumentSearchResult } from "./types";

export class DocumentSearchService {
  async search(
    query: string,
  ): Promise<DocumentSearchResult[]> {
    console.log("Searching documents:", query);
    return [];
  }

  async searchByCategory(
    category: string,
  ): Promise<DocumentSearchResult[]> {
    console.log("Searching category:", category);
    return [];
  }
}

export const documentSearchService =
  new DocumentSearchService();
