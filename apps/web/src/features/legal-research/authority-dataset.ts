import type {LegalAuthority} from "./authorities";

export interface LegalAuthorityDatasetSource {
  name: string;
  version: string;
  standard: string;
}

export interface LegalAuthorityDataset {
  schemaVersion: string;
  source: LegalAuthorityDatasetSource;
  generatedAt: string;
  authorities: LegalAuthority[];
}
