"use strict";

const { loadLegalJurisdictions } = require("./jurisdiction-loader");

const LEGAL_JURISDICTION_LEVELS = new Set([
  "country",
  "state",
  "province",
  "territory",
  "region",
  "federal-district",
  "autonomous-area",
  "other",
]);

class ServerLegalJurisdictionRegistry {
  constructor(jurisdictions) {
    const resolvedJurisdictions =
      jurisdictions === undefined
        ? loadLegalJurisdictions()
        : jurisdictions;

    if (!Array.isArray(resolvedJurisdictions)) {
      throw new Error(
        "Legal jurisdiction registry jurisdictions must be an array.",
      );
    }

    const seenIds = new Set();
    const normalizedJurisdictions = [];

    for (const jurisdiction of resolvedJurisdictions) {
      validateJurisdictionRecord(jurisdiction);

      if (seenIds.has(jurisdiction.id)) {
        throw new Error(
          `Duplicate legal jurisdiction id "${jurisdiction.id}" found in jurisdiction registry.`,
        );
      }

      seenIds.add(jurisdiction.id);
      normalizedJurisdictions.push(
        cloneJurisdictionRecord(jurisdiction),
      );
    }

    this.jurisdictions = Object.freeze(normalizedJurisdictions);
  }

  getById(id) {
    return this.jurisdictions.find(
      (jurisdiction) => jurisdiction.id === id,
    );
  }

  getChildren(parentJurisdictionId) {
    return this.jurisdictions.filter(
      (jurisdiction) =>
        jurisdiction.parentJurisdictionId === parentJurisdictionId,
    );
  }

  getCountry(countryCode) {
    const normalizedCode =
      typeof countryCode === "string"
        ? countryCode.trim().toUpperCase()
        : "";

    return this.jurisdictions.find(
      (jurisdiction) =>
        jurisdiction.level === "country" &&
        jurisdiction.countryCode === normalizedCode,
    );
  }

  resolve(ref) {
    if (!ref || typeof ref !== "object" || Array.isArray(ref)) {
      return undefined;
    }

    if (
      typeof ref.jurisdictionId === "string" &&
      ref.jurisdictionId.trim().length > 0
    ) {
      return this.getById(ref.jurisdictionId);
    }

    if (
      typeof ref.countryCode === "string" &&
      ref.countryCode.trim().length > 0
    ) {
      return this.getCountry(ref.countryCode);
    }

    return undefined;
  }
}

function validateJurisdictionRecord(jurisdiction) {
  if (
    !jurisdiction ||
    typeof jurisdiction !== "object" ||
    Array.isArray(jurisdiction)
  ) {
    throw new Error("Invalid legal jurisdiction record.");
  }

  for (const field of [
    "id",
    "name",
    "level",
    "countryCode",
  ]) {
    if (
      typeof jurisdiction[field] !== "string" ||
      jurisdiction[field].trim().length === 0
    ) {
      throw new Error(
        `Invalid legal jurisdiction record ${field}.`,
      );
    }
  }

  if (!LEGAL_JURISDICTION_LEVELS.has(jurisdiction.level)) {
    throw new Error(
      "Invalid legal jurisdiction record level.",
    );
  }

  for (const field of [
    "parentJurisdictionId",
    "officialName",
  ]) {
    if (
      jurisdiction[field] !== undefined &&
      typeof jurisdiction[field] !== "string"
    ) {
      throw new Error(
        `Invalid legal jurisdiction ${field}.`,
      );
    }
  }

  if (typeof jurisdiction.active !== "boolean") {
    throw new Error(
      "Invalid legal jurisdiction active.",
    );
  }
}

function cloneJurisdictionRecord(jurisdiction) {
  return {
    ...jurisdiction,
  };
}

module.exports = {
  ServerLegalJurisdictionRegistry,
};
