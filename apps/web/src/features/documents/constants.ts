export const DOCUMENT_STATUS = {
  DRAFT: "draft",
  GENERATED: "generated",
  ARCHIVED: "archived",
} as const;

export const DOCUMENT_CATEGORIES = [
  "affidavit",
  "agreement",
  "contract",
  "notice",
  "certificate",
  "application",
] as const;

export const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10 MB

export const SUPPORTED_EXPORT_FORMATS = [
  "pdf",
  "docx",
  "txt",
] as const;
