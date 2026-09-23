import {
  InMemoryLegalSourceRegistry,
  type LegalSourceRecord,
} from "./sources";
import type {LegalAuthorityRegistry} from "./authorities";
import type {LegalJurisdictionRegistry} from "./jurisdictions";
import {loadLegalSources} from "./source-loader";
import {createLegalAuthorityRegistry} from "./authority-registry";
import {createLegalJurisdictionRegistry} from "./jurisdiction-registry";

function validateSourceReferences(
  sources: readonly LegalSourceRecord[],
  authorityRegistry: LegalAuthorityRegistry,
  jurisdictionRegistry: LegalJurisdictionRegistry,
): void {
  for (const source of sources) {
    const sourceJurisdictionId = source.jurisdiction?.jurisdictionId;

    if (sourceJurisdictionId) {
      const jurisdiction = jurisdictionRegistry.getById(
        sourceJurisdictionId,
      );

      if (!jurisdiction) {
        throw new Error(
          `Legal source "${source.id}" references unknown jurisdiction "${sourceJurisdictionId}".`,
        );
      }

      if (
        source.jurisdiction?.countryCode &&
        jurisdiction.countryCode.toUpperCase() !==
          source.jurisdiction.countryCode.trim().toUpperCase()
      ) {
        throw new Error(
          `Legal source "${source.id}" country "${source.jurisdiction.countryCode}" does not match jurisdiction "${jurisdiction.id}" country "${jurisdiction.countryCode}".`,
        );
      }
    }

    if (source.authorityId) {
      const authority = authorityRegistry.getById(source.authorityId);

      if (!authority) {
        throw new Error(
          `Legal source "${source.id}" references unknown authority "${source.authorityId}".`,
        );
      }

      if (
        source.jurisdiction?.jurisdictionId &&
        authority.jurisdictionId &&
        source.jurisdiction.jurisdictionId !== authority.jurisdictionId
      ) {
        throw new Error(
          `Legal source "${source.id}" has jurisdiction "${source.jurisdiction.jurisdictionId}" that does not match authority "${source.authorityId}" jurisdiction "${authority.jurisdictionId}".`,
        );
      }

      if (
        source.jurisdiction?.countryCode &&
        authority.countryCode.toUpperCase() !==
          source.jurisdiction.countryCode.trim().toUpperCase()
      ) {
        throw new Error(
          `Legal source "${source.id}" country "${source.jurisdiction.countryCode}" does not match authority "${source.authorityId}" country "${authority.countryCode}".`,
        );
      }
    }
  }
}

export async function createLegalSourceRegistry(
  sources?: readonly LegalSourceRecord[],
  authorityRegistry?: LegalAuthorityRegistry,
  jurisdictionRegistry?: LegalJurisdictionRegistry,
): Promise<InMemoryLegalSourceRegistry> {
  const resolvedJurisdictionRegistry =
    jurisdictionRegistry ?? (await createLegalJurisdictionRegistry());

  const resolvedAuthorityRegistry =
    authorityRegistry ??
    (await createLegalAuthorityRegistry(
      undefined,
      resolvedJurisdictionRegistry,
    ));

  const resolvedSources = sources ?? (await loadLegalSources());

  validateSourceReferences(
    resolvedSources,
    resolvedAuthorityRegistry,
    resolvedJurisdictionRegistry,
  );

  return new InMemoryLegalSourceRegistry(resolvedSources);
}
