import dataset from "../../../../../data/legal_authorities.json";
import type {
  LegalAuthority,
  LegalAuthorityType,
} from "./authorities";
import type {
  LegalAuthorityDataset,
  LegalAuthorityDatasetSource,
} from "./authority-dataset";

const LEGAL_AUTHORITY_TYPES: readonly LegalAuthorityType[] = [
  "court",
  "tribunal",
  "administrative-authority",
  "legislative-body",
  "regulatory-authority",
  "other",
];

function isDatasetSource(
  value: unknown,
): value is LegalAuthorityDatasetSource {
  if (!value || typeof value !== "object") {
    return false;
  }

  const source = value as Record<string, unknown>;

  return (
    typeof source.name === "string" &&
    source.name.length > 0 &&
    typeof source.version === "string" &&
    source.version.length > 0 &&
    typeof source.standard === "string" &&
    source.standard.length > 0
  );
}

function isLegalAuthority(value: unknown): value is LegalAuthority {
  if (!value || typeof value !== "object") {
    return false;
  }

  const authority = value as Record<string, unknown>;

  return (
    typeof authority.id === "string" &&
    authority.id.length > 0 &&
    typeof authority.name === "string" &&
    authority.name.length > 0 &&
    typeof authority.type === "string" &&
    LEGAL_AUTHORITY_TYPES.includes(
      authority.type as LegalAuthorityType,
    ) &&
    typeof authority.countryCode === "string" &&
    authority.countryCode.length > 0 &&
    (authority.jurisdictionId === undefined ||
      typeof authority.jurisdictionId === "string") &&
    (authority.parentAuthorityId === undefined ||
      typeof authority.parentAuthorityId === "string") &&
    (authority.officialName === undefined ||
      typeof authority.officialName === "string") &&
    (authority.officialUrl === undefined ||
      typeof authority.officialUrl === "string") &&
    typeof authority.active === "boolean"
  );
}

export function validateLegalAuthorityDataset(
  value: unknown,
): LegalAuthorityDataset {
  if (!value || typeof value !== "object") {
    throw new Error(
      "Legal authority dataset must be an object.",
    );
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.schemaVersion !== "string" ||
    candidate.schemaVersion.length === 0
  ) {
    throw new Error(
      "Legal authority dataset schemaVersion is invalid.",
    );
  }

  if (!isDatasetSource(candidate.source)) {
    throw new Error(
      "Legal authority dataset source is invalid.",
    );
  }

  if (
    typeof candidate.generatedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.generatedAt))
  ) {
    throw new Error(
      "Legal authority dataset generatedAt is invalid.",
    );
  }

  if (!Array.isArray(candidate.authorities)) {
    throw new Error(
      "Legal authority dataset authorities must be an array.",
    );
  }

  if (!candidate.authorities.every(isLegalAuthority)) {
    throw new Error(
      "Legal authority dataset contains an invalid authority.",
    );
  }

  const ids = new Set<string>();

  for (const authority of candidate.authorities) {
    if (ids.has(authority.id)) {
      throw new Error(
        `Legal authority dataset contains duplicate authority ID "${authority.id}".`,
      );
    }

    ids.add(authority.id);
  }

  for (const authority of candidate.authorities) {
    if (
      authority.parentAuthorityId &&
      !ids.has(authority.parentAuthorityId)
    ) {
      throw new Error(
        `Legal authority "${authority.id}" references missing parent "${authority.parentAuthorityId}".`,
      );
    }
  }

  return {
    schemaVersion: candidate.schemaVersion,
    source: candidate.source,
    generatedAt: candidate.generatedAt,
    authorities: candidate.authorities as LegalAuthority[],
  };
}

export async function loadLegalAuthoritiesFromDataset(
  value: unknown,
): Promise<LegalAuthority[]> {
  const dataset = validateLegalAuthorityDataset(value);

  return dataset.authorities.map((authority) => ({
    ...authority,
  }));
}

const legalAuthorityDataset = validateLegalAuthorityDataset(dataset);

export async function loadLegalAuthorities(): Promise<LegalAuthority[]> {
  return legalAuthorityDataset.authorities.map((authority) => ({
    ...authority,
  }));
}
