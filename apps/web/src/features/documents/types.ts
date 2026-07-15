export type DocumentStatus =
  | "draft"
  | "generating"
  | "generated"
  | "review"
  | "published"
  | "archived"
  | "deleted";

export interface DocumentMetadata {
  version: number;
  language: string;
  country: string;
  templateId?: string;
  aiProvider?: string;
  aiModel?: string;
  generatedBy?: string;
}

export interface Document {
  id: string;
  title: string;
  type: string;

  status: DocumentStatus;

  content: string;

  summary?: string;

  tags: string[];

  ownerId: string;

  metadata: DocumentMetadata;

  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplate {
  id: string;

  name: string;

  category: string;

  description?: string;

  language?: string;

  country?: string;

  fields: string[];

  active: boolean;
}

export interface DocumentHistory {
  id: string;

  documentId: string;

  action: string;

  performedBy: string;

  createdAt: Date;
}

export interface DocumentSearchResult {
  id: string;

  title: string;

  type: string;

  status: DocumentStatus;

  matchedFields: string[];
}
