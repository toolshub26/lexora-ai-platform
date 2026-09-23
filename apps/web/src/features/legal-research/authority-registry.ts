import {
  InMemoryLegalAuthorityRegistry,
  type LegalAuthority,
} from "./authorities";
import type { LegalJurisdictionRegistry } from "./jurisdictions";
import { loadLegalAuthorities } from "./authority-loader";

export async function createLegalAuthorityRegistry(
  authorities?: readonly LegalAuthority[],
  jurisdictionRegistry?: LegalJurisdictionRegistry,
): Promise<InMemoryLegalAuthorityRegistry> {
  const resolvedAuthorities =
    authorities ?? (await loadLegalAuthorities());

  return new InMemoryLegalAuthorityRegistry(
    resolvedAuthorities,
    jurisdictionRegistry,
  );
}
