import type {LegalSourceRecord} from "./sources";

export interface LegalSourceDatasetSource {
  name: string;
  version: string;
  standard: string;
}

export interface LegalSourceDataset {
  schemaVersion: string;
  source: LegalSourceDatasetSource;
  generatedAt: string;
  sources: LegalSourceRecord[];
}
