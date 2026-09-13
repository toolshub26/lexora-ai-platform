import type {LegalJurisdiction} from "./jurisdictions";

export interface LegalJurisdictionDatasetSource {
  name: string;
  packageVersion: string;
  standard: string;
}

export interface LegalJurisdictionDataset {
  schemaVersion: string;
  source: LegalJurisdictionDatasetSource;
  generatedAt: string;
  jurisdictions: LegalJurisdiction[];
}
