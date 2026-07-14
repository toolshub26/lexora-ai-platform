export interface Document {
  id: string;
  title: string;
  type: string;
  status: "draft" | "generated" | "archived";
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  action: string;
  createdAt: Date;
}

export interface DocumentSearchResult {
  id: string;
  title: string;
  matchedFields: string[];
}
