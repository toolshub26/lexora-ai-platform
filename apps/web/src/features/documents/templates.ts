import type { DocumentTemplate } from "./types";

export class DocumentTemplateService {
  async getTemplates(): Promise<DocumentTemplate[]> {
    console.log("Loading document templates");
    return [];
  }

  async getTemplate(
    templateId: string,
  ): Promise<DocumentTemplate | null> {
    console.log("Loading template:", templateId);
    return null;
  }

  async searchTemplates(
    query: string,
  ): Promise<DocumentTemplate[]> {
    console.log("Searching templates:", query);
    return [];
  }
}

export const documentTemplateService =
  new DocumentTemplateService();
