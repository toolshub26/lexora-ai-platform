import type { LegalJurisdictionRef } from "./types";

export type LegalJurisdictionLevel =
  | "country"
  | "state"
  | "province"
  | "territory"
  | "region"
  | "federal-district"
  | "autonomous-area"
  | "other";

export interface LegalJurisdiction {
  id: string;
  name: string;
  level: LegalJurisdictionLevel;
  countryCode: string;
  parentJurisdictionId?: string;
  officialName?: string;
  active: boolean;
}

export interface LegalJurisdictionRegistry {
  getById(id: string): LegalJurisdiction | undefined;
  getChildren(parentJurisdictionId: string): LegalJurisdiction[];
  getCountry(countryCode: string): LegalJurisdiction | undefined;
  resolve(ref: LegalJurisdictionRef): LegalJurisdiction | undefined;
}

export class InMemoryLegalJurisdictionRegistry
  implements LegalJurisdictionRegistry
{
  private readonly jurisdictions: readonly LegalJurisdiction[];

  constructor(jurisdictions: readonly LegalJurisdiction[] = []) {
    this.jurisdictions = jurisdictions;
  }

  getById(id: string): LegalJurisdiction | undefined {
    return this.jurisdictions.find((jurisdiction) => jurisdiction.id === id);
  }

  getChildren(parentJurisdictionId: string): LegalJurisdiction[] {
    return this.jurisdictions.filter(
      (jurisdiction) =>
        jurisdiction.parentJurisdictionId === parentJurisdictionId,
    );
  }

  getCountry(countryCode: string): LegalJurisdiction | undefined {
    const normalizedCode = countryCode.trim().toUpperCase();

    return this.jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.level === "country" &&
        jurisdiction.countryCode === normalizedCode,
    );
  }

  resolve(ref: LegalJurisdictionRef): LegalJurisdiction | undefined {
    if (ref.jurisdictionId) {
      return this.getById(ref.jurisdictionId);
    }

    if (ref.countryCode) {
      return this.getCountry(ref.countryCode);
    }

    return undefined;
  }
}

export const legalJurisdictionRegistry =
  new InMemoryLegalJurisdictionRegistry();
