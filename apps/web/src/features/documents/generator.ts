import type { Document } from "./types";
import { documentService } from "./service";

export class DocumentGeneratorService {
  private validate(document: Document): void {
    if (!document.title.trim()) {
      throw new Error("Document title is required.");
    }

    if (!document.type.trim()) {
      throw new Error("Document type is required.");
    }

    if (!document.content.trim()) {
      throw new Error("Document content is required.");
    }
  }

  async generate(document: Document): Promise<Document> {
    this.validate(document);

    const generated: Document = {
      ...document,
      status: "generated",
      summary:
        document.content.substring(0, 200) +
        (document.content.length > 200 ? "..." : ""),
      updatedAt: new Date(),
      metadata: {
        ...document.metadata,
        version: document.metadata.version + 1,
        generatedBy: "Lexora AI",
      },
    };

    await documentService.update(generated.id, generated);

    return generated;
  }

  async regenerate(document: Document): Promise<Document> {
    this.validate(document);

    const regenerated: Document = {
      ...document,
      status: "generated",
      updatedAt: new Date(),
      metadata: {
        ...document.metadata,
        version: document.metadata.version + 1,
      },
    };

    await documentService.update(regenerated.id, regenerated);

    return regenerated;
  }
}

export const documentGeneratorService =
  new DocumentGeneratorService();
