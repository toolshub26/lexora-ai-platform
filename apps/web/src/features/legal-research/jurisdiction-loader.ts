import dataset from "../../../../../data/legal_jurisdictions.json";

import type {
  LegalJurisdictionDataset,
  LegalJurisdictionDatasetSource,
} from "./jurisdiction-dataset";
import type {LegalJurisdiction} from "./jurisdictions";

function isDatasetSource(
  value: unknown,
): value is LegalJurisdictionDatasetSource {
  if (!value || typeof value !== "object") {
    return false;
  }

  const source = value as Record<string, unknown>;

  return (
    typeof source.name === "string" &&
    source.name.length > 0 &&
    typeof source.packageVersion === "string" &&
    source.packageVersion.length > 0 &&
    typeof source.standard === "string" &&
    source.standard.length > 0
  );
}

function isLegalJurisdiction(
  value: unknown,
): value is LegalJurisdiction {
  if (!value || typeof value !== "object") {
    return false;
  }

  const jurisdiction = value as Record<string, unknown>;

  return (
    typeof jurisdiction.id === "string" &&
    typeof jurisdiction.name === "string" &&
    typeof jurisdiction.level === "string" &&
    typeof jurisdiction.countryCode === "string" &&
    typeof jurisdiction.active === "boolean" &&
    (jurisdiction.parentJurisdictionId === undefined ||
      typeof jurisdiction.parentJurisdictionId === "string")
  );
}

function validateDataset(
  value: unknown,
): LegalJurisdictionDataset {
  if (!value || typeof value !== "object") {
    throw new Error(
      "Legal jurisdiction dataset must be an object.",
    );
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.schemaVersion !== "string" ||
    candidate.schemaVersion.length === 0
  ) {
    throw new Error(
      "Legal jurisdiction dataset schemaVersion is invalid.",
    );
  }

  if (!isDatasetSource(candidate.source)) {
    throw new Error(
      "Legal jurisdiction dataset source is invalid.",
    );
  }

  if (
    typeof candidate.generatedAt !== "string" ||
    Number.isNaN(Date.parse(candidate.generatedAt))
  ) {
    throw new Error(
      "Legal jurisdiction dataset generatedAt is invalid.",
    );
  }

  if (!Array.isArray(candidate.jurisdictions)) {
    throw new Error(
      "Legal jurisdiction dataset jurisdictions must be an array.",
    );
  }

  if (!candidate.jurisdictions.every(isLegalJurisdiction)) {
    throw new Error(
      "Legal jurisdiction dataset contains an invalid jurisdiction.",
    );
  }

  const ids = new Set(
    candidate.jurisdictions.map(
      (jurisdiction) => jurisdiction.id,
    ),
  );

  for (const jurisdiction of candidate.jurisdictions) {
    if (
      jurisdiction.parentJurisdictionId &&
      !ids.has(jurisdiction.parentJurisdictionId)
    ) {
      throw new Error(
        `Legal jurisdiction "${jurisdiction.id}" references missing parent "${jurisdiction.parentJurisdictionId}".`,
      );
    }
  }

  return {
    schemaVersion: candidate.schemaVersion,
    source: candidate.source,
    generatedAt: candidate.generatedAt,
    jurisdictions: candidate.jurisdictions as LegalJurisdiction[],
  };
}

const legalJurisdictionDataset = validateDataset(dataset);

export async function loadLegalJurisdictions(): Promise<
  LegalJurisdiction[]
> {
  return legalJurisdictionDataset.jurisdictions.map(
    (jurisdiction) => ({...jurisdiction}),
  );
}
