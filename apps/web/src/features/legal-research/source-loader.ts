import dataset from "../../../../../data/legal_sources.json";
import type {LegalSourceType} from "./types";
import type {
  LegalSourceAuthorityLevel,
  LegalSourceAvailability,
  LegalSourceRecord,
} from "./sources";
import type {
  LegalSourceDataset,
  LegalSourceDatasetSource,
} from "./source-dataset";

const LEGAL_SOURCE_TYPES: readonly LegalSourceType[] = [
  "cases",
  "statutes",
  "regulations",
  "rules",
  "official-publications",
  "administrative-decisions",
  "treaties",
  "official-guidance",
  "secondary",
];

const LEGAL_SOURCE_AUTHORITY_LEVELS: readonly LegalSourceAuthorityLevel[] = [
  "primary",
  "secondary",
];

const LEGAL_SOURCE_AVAILABILITY: readonly LegalSourceAvailability[] = [
  "available",
  "unavailable",
  "restricted",
];

function isDatasetSource(
  value: unknown,
): value is LegalSourceDatasetSource {
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

function parseHttpsUrl(value: unknown): string | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || value.length === 0) {
    return undefined;
  }

  try {
    const url = new URL(value);

    if (url.protocol !== "https:") {
      return undefined;
    }

    return value;
  } catch {
    return undefined;
  }
}

function parseDate(value: unknown): Date | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value !== "string" || Number.isNaN(Date.parse(value))) {
    return undefined;
  }

  return new Date(value);
}

function isValidJurisdiction(value: unknown): boolean {
  if (!value || typeof value !== "object") {
    return false;
  }

  const jurisdiction = value as Record<string, unknown>;

  if (
    jurisdiction.countryCode !== undefined &&
    (typeof jurisdiction.countryCode !== "string" ||
      jurisdiction.countryCode.length === 0)
  ) {
    return false;
  }

  if (
    jurisdiction.jurisdictionId !== undefined &&
    (typeof jurisdiction.jurisdictionId !== "string" ||
      jurisdiction.jurisdictionId.length === 0)
  ) {
    return false;
  }

  if (
    jurisdiction.authorityId !== undefined &&
    (typeof jurisdiction.authorityId !== "string" ||
      jurisdiction.authorityId.length === 0)
  ) {
    return false;
  }

  return true;
}

function normalizeLegalSource(
  value: unknown,
): LegalSourceRecord | undefined {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const source = value as Record<string, unknown>;

  if (
    typeof source.id !== "string" ||
    source.id.length === 0 ||
    typeof source.title !== "string" ||
    source.title.length === 0 ||
    typeof source.citation !== "string" ||
    source.citation.length === 0 ||
    typeof source.sourceType !== "string" ||
    !LEGAL_SOURCE_TYPES.includes(source.sourceType as LegalSourceType) ||
    typeof source.authorityLevel !== "string" ||
    !LEGAL_SOURCE_AUTHORITY_LEVELS.includes(
      source.authorityLevel as LegalSourceAuthorityLevel,
    ) ||
    typeof source.availability !== "string" ||
    !LEGAL_SOURCE_AVAILABILITY.includes(
      source.availability as LegalSourceAvailability,
    ) ||
    !isValidJurisdiction(source.jurisdiction)
  ) {
    return undefined;
  }

  const retrievedAt = parseDate(source.retrievedAt);

  if (!retrievedAt) {
    return undefined;
  }

  const sourceUrl =
    source.sourceUrl === undefined
      ? undefined
      : parseHttpsUrl(source.sourceUrl);

  const canonicalUrl =
    source.canonicalUrl === undefined
      ? undefined
      : parseHttpsUrl(source.canonicalUrl);

  if (
    (source.sourceUrl !== undefined && !sourceUrl) ||
    (source.canonicalUrl !== undefined && !canonicalUrl)
  ) {
    return undefined;
  }

  const publishedAt = parseDate(source.publishedAt);
  const effectiveFrom = parseDate(source.effectiveFrom);
  const effectiveTo = parseDate(source.effectiveTo);

  if (
    (source.publishedAt !== undefined && !publishedAt) ||
    (source.effectiveFrom !== undefined && !effectiveFrom) ||
    (source.effectiveTo !== undefined && !effectiveTo)
  ) {
    return undefined;
  }

  if (
    effectiveFrom &&
    effectiveTo &&
    effectiveFrom.getTime() > effectiveTo.getTime()
  ) {
    return undefined;
  }

  if (
    source.authorityId !== undefined &&
    (typeof source.authorityId !== "string" ||
      source.authorityId.length === 0)
  ) {
    return undefined;
  }

  if (
    source.authorityName !== undefined &&
    (typeof source.authorityName !== "string" ||
      source.authorityName.length === 0)
  ) {
    return undefined;
  }

  return {
    id: source.id,
    title: source.title,
    citation: source.citation,
    sourceType: source.sourceType as LegalSourceType,
    authorityLevel:
      source.authorityLevel as LegalSourceAuthorityLevel,
    jurisdiction:
      source.jurisdiction === undefined
        ? undefined
        : {
            ...(source.jurisdiction as Record<string, unknown>),
          } as LegalSourceRecord["jurisdiction"],
    authorityId: source.authorityId as string | undefined,
    authorityName: source.authorityName as string | undefined,
    sourceUrl,
    canonicalUrl,
    publishedAt,
    effectiveFrom,
    effectiveTo,
    availability:
      source.availability as LegalSourceAvailability,
    retrievedAt,
  };
}

export function validateLegalSourceDataset(
  value: unknown,
): LegalSourceDataset {
  if (!value || typeof value !== "object") {
    throw new Error("Legal source dataset must be an object.");
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.schemaVersion !== "string" ||
    candidate.schemaVersion.length === 0
  ) {
    throw new Error("Legal source dataset schemaVersion is invalid.");
  }

  if (!isDatasetSource(candidate.source)) {
    throw new Error("Legal source dataset source is invalid.");
  }

  if (
    typeof candidate.generatedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.generatedAt))
  ) {
    throw new Error("Legal source dataset generatedAt is invalid.");
  }

  if (!Array.isArray(candidate.sources)) {
    throw new Error("Legal source dataset sources must be an array.");
  }

  const sources: LegalSourceRecord[] = [];

  for (const value of candidate.sources) {
    const source = normalizeLegalSource(value);

    if (!source) {
      throw new Error(
        "Legal source dataset contains an invalid source.",
      );
    }

    sources.push(source);
  }

  const ids = new Set<string>();

  for (const source of sources) {
    if (ids.has(source.id)) {
      throw new Error(
        `Legal source dataset contains duplicate source ID "${source.id}".`,
      );
    }

    ids.add(source.id);
  }

  return {
    schemaVersion: candidate.schemaVersion,
    source: candidate.source,
    generatedAt: candidate.generatedAt,
    sources,
  };
}

export async function loadLegalSourcesFromDataset(
  value: unknown,
): Promise<LegalSourceRecord[]> {
  const sourceDataset = validateLegalSourceDataset(value);

  return sourceDataset.sources.map((source) => ({
    ...source,
    jurisdiction: source.jurisdiction
      ? {...source.jurisdiction}
      : undefined,
  }));
}

const legalSourceDataset = validateLegalSourceDataset(dataset);

export async function loadLegalSources(): Promise<LegalSourceRecord[]> {
  return legalSourceDataset.sources.map((source) => ({
    ...source,
    jurisdiction: source.jurisdiction
      ? {...source.jurisdiction}
      : undefined,
  }));
}
