import type {LegalJurisdictionRegistry} from "./jurisdictions";

export type LegalAuthorityType =
  | "court"
  | "tribunal"
  | "administrative-authority"
  | "legislative-body"
  | "regulatory-authority"
  | "other";

export interface LegalAuthority {
  id: string;
  name: string;
  type: LegalAuthorityType;
  countryCode: string;
  jurisdictionId?: string;
  parentAuthorityId?: string;
  officialName?: string;
  officialUrl?: string;
  active: boolean;
}

export interface LegalAuthorityRegistry {
  getById(id: string): LegalAuthority | undefined;
  getByJurisdiction(jurisdictionId: string): LegalAuthority[];
  getByCountry(countryCode: string): LegalAuthority[];
}

export class InMemoryLegalAuthorityRegistry
  implements LegalAuthorityRegistry
{
  private readonly authorities: readonly LegalAuthority[];
  private readonly jurisdictionRegistry?: LegalJurisdictionRegistry;

  constructor(
    authorities: readonly LegalAuthority[] = [],
    jurisdictionRegistry?: LegalJurisdictionRegistry,
  ) {
    this.jurisdictionRegistry = jurisdictionRegistry;

    for (const authority of authorities) {
      if (
        authority.jurisdictionId &&
        jurisdictionRegistry &&
        !jurisdictionRegistry.getById(authority.jurisdictionId)
      ) {
        throw new Error(
          `Legal authority "${authority.id}" references unknown jurisdiction "${authority.jurisdictionId}".`,
        );
      }
    }

    this.authorities = authorities;
  }

  getById(id: string): LegalAuthority | undefined {
    return this.authorities.find(
      (authority) => authority.id === id,
    );
  }

  getByJurisdiction(jurisdictionId: string): LegalAuthority[] {
    return this.authorities.filter(
      (authority) =>
        authority.jurisdictionId === jurisdictionId,
    );
  }

  getByCountry(countryCode: string): LegalAuthority[] {
    const normalizedCode = countryCode.trim().toUpperCase();

    return this.authorities.filter(
      (authority) => authority.countryCode === normalizedCode,
    );
  }
}

export const legalAuthorityRegistry =
  new InMemoryLegalAuthorityRegistry();
