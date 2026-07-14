import type { Document } from "./types";

export class DocumentGeneratorService {
  async generate(
    document: Document,
  ): Promise<Document> {
    console.log("Generating document:", document);

    return {
      ...document,
      status: "generated",
      updatedAt: new Date(),
    };
  }

  async regenerate(
    document: Document,
  ): Promise<Document> {
    console.log("Regenerating document:", document);

    return {
      ...document,
      updatedAt: new Date(),
    };
  }
}

export const documentGeneratorService =
  new DocumentGeneratorService();
