"use strict";

const { loadLegalSources } = require("./source-loader");

const LEGAL_SOURCE_TYPES = new Set([
  "cases",
  "statutes",
  "regulations",
  "rules",
  "official-publications",
  "administrative-decisions",
  "treaties",
  "official-guidance",
  "secondary",
]);

const LEGAL_AUTHORITY_LEVELS = new Set([
  "primary",
  "secondary",
]);

const LEGAL_SOURCE_AVAILABILITY = new Set([
  "available",
  "unavailable",
  "restricted",
]);

class ServerLegalSourceRegistry {
  constructor(sources) {
    const resolvedSources =
      sources === undefined ? loadLegalSources() : sources;

    if (!Array.isArray(resolvedSources)) {
      throw new Error("Legal source registry sources must be an array.");
    }

    const seenIds = new Set();
    const normalizedSources = [];

    for (const source of resolvedSources) {
      validateSourceRecord(source);

      if (seenIds.has(source.id)) {
        throw new Error(
          `Duplicate legal source id "${source.id}" found in source registry.`,
        );
      }

      seenIds.add(source.id);
      normalizedSources.push(cloneSourceRecord(source));
    }

    this.sources = Object.freeze(normalizedSources);
  }

  getById(id) {
    return this.sources.find((source) => source.id === id);
  }

  getByJurisdiction(jurisdiction) {
    if (!jurisdiction || typeof jurisdiction !== "object") {
      return [];
    }

    const jurisdictionId =
      typeof jurisdiction.jurisdictionId === "string"
        ? jurisdiction.jurisdictionId.trim()
        : "";

    const countryCode =
      typeof jurisdiction.countryCode === "string"
        ? jurisdiction.countryCode.trim().toUpperCase()
        : "";

    return this.sources.filter((source) => {
      if (!source.jurisdiction) {
        return false;
      }

      if (
        jurisdictionId &&
        source.jurisdiction.jurisdictionId !== jurisdictionId
      ) {
        return false;
      }

      if (
        countryCode &&
        source.jurisdiction.countryCode?.toUpperCase() !== countryCode
      ) {
        return false;
      }

      return true;
    });
  }

  getByType(sourceType) {
    return this.sources.filter(
      (source) => source.sourceType === sourceType,
    );
  }

  getByAuthority(authorityId) {
    return this.sources.filter(
      (source) => source.authorityId === authorityId,
    );
  }
}

function validateSourceRecord(source) {
  if (!source || typeof source !== "object" || Array.isArray(source)) {
    throw new Error("Invalid legal source record.");
  }

  if (
    typeof source.id !== "string" ||
    source.id.trim().length === 0
  ) {
    throw new Error("Invalid legal source record id.");
  }

  if (
    typeof source.title !== "string" ||
    source.title.trim().length === 0
  ) {
    throw new Error("Invalid legal source record title.");
  }

  if (
    typeof source.citation !== "string" ||
    source.citation.trim().length === 0
  ) {
    throw new Error("Invalid legal source record citation.");
  }

  if (!LEGAL_SOURCE_TYPES.has(source.sourceType)) {
    throw new Error("Invalid legal source record sourceType.");
  }

  if (!LEGAL_AUTHORITY_LEVELS.has(source.authorityLevel)) {
    throw new Error("Invalid legal source record authorityLevel.");
  }

  if (!LEGAL_SOURCE_AVAILABILITY.has(source.availability)) {
    throw new Error("Invalid legal source record availability.");
  }

  if (!(source.retrievedAt instanceof Date)) {
    throw new Error("Invalid legal source record retrievedAt.");
  }

  if (source.jurisdiction !== undefined) {
    validateJurisdiction(source.jurisdiction);
  }

  validateOptionalString(source.authorityId, "authorityId");
  validateOptionalString(source.authorityName, "authorityName");
  validateOptionalString(source.sourceUrl, "sourceUrl");
  validateOptionalString(source.canonicalUrl, "canonicalUrl");

  validateOptionalDate(source.publishedAt, "publishedAt");
  validateOptionalDate(source.effectiveFrom, "effectiveFrom");
  validateOptionalDate(source.effectiveTo, "effectiveTo");
}

function validateJurisdiction(jurisdiction) {
  if (
    !jurisdiction ||
    typeof jurisdiction !== "object" ||
    Array.isArray(jurisdiction)
  ) {
    throw new Error("Invalid legal source jurisdiction.");
  }

  validateOptionalString(
    jurisdiction.countryCode,
    "jurisdiction.countryCode",
  );

  validateOptionalString(
    jurisdiction.jurisdictionId,
    "jurisdiction.jurisdictionId",
  );

  validateOptionalString(
    jurisdiction.authorityId,
    "jurisdiction.authorityId",
  );
}

function validateOptionalString(value, fieldName) {
  if (value !== undefined && typeof value !== "string") {
    throw new Error(`Invalid legal source ${fieldName}.`);
  }
}

function validateOptionalDate(value, fieldName) {
  if (value !== undefined && !(value instanceof Date)) {
    throw new Error(`Invalid legal source ${fieldName}.`);
  }
}

function cloneSourceRecord(source) {
  return {
    ...source,
    jurisdiction: source.jurisdiction
      ? { ...source.jurisdiction }
      : undefined,
  };
}

module.exports = {
  ServerLegalSourceRegistry,
};
