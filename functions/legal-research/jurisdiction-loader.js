"use strict";

const fs = require("node:fs");
const path = require("node:path");

function loadLegalJurisdictionDataset() {
  const datasetPath = path.resolve(
    __dirname,
    "../../data/legal_jurisdictions.json",
  );

  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  } catch (error) {
    throw new Error(
      `Failed to load legal jurisdiction dataset: ${error.message}`,
    );
  }

  return validateLegalJurisdictionDataset(parsed);
}

function validateLegalJurisdictionDataset(dataset) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset)
  ) {
    throw new Error("Invalid legal jurisdiction dataset.");
  }

  if (
    typeof dataset.schemaVersion !== "string" ||
    dataset.schemaVersion.trim().length === 0
  ) {
    throw new Error(
      "Invalid legal jurisdiction dataset schemaVersion.",
    );
  }

  if (
    !dataset.source ||
    typeof dataset.source !== "object" ||
    Array.isArray(dataset.source)
  ) {
    throw new Error(
      "Invalid legal jurisdiction dataset source.",
    );
  }

  for (const field of ["name", "packageVersion", "standard"]) {
    if (
      typeof dataset.source[field] !== "string" ||
      dataset.source[field].trim().length === 0
    ) {
      throw new Error(
        `Invalid legal jurisdiction dataset source field "${field}".`,
      );
    }
  }

  if (
    typeof dataset.generatedAt !== "string" ||
    Number.isNaN(Date.parse(dataset.generatedAt))
  ) {
    throw new Error(
      "Invalid legal jurisdiction dataset generatedAt.",
    );
  }

  if (!Array.isArray(dataset.jurisdictions)) {
    throw new Error(
      "Legal jurisdiction dataset jurisdictions must be an array.",
    );
  }

  const seenIds = new Set();
  const jurisdictions = [];

  for (const jurisdiction of dataset.jurisdictions) {
    validateLegalJurisdictionRecord(jurisdiction);

    if (seenIds.has(jurisdiction.id)) {
      throw new Error(
        `Duplicate legal jurisdiction id "${jurisdiction.id}" found in dataset.`,
      );
    }

    seenIds.add(jurisdiction.id);
    jurisdictions.push(cloneLegalJurisdictionRecord(jurisdiction));
  }

  for (const jurisdiction of dataset.jurisdictions) {
    if (
      jurisdiction.parentJurisdictionId &&
      !seenIds.has(jurisdiction.parentJurisdictionId)
    ) {
      throw new Error(
        `Legal jurisdiction "${jurisdiction.id}" references missing parent "${jurisdiction.parentJurisdictionId}".`,
      );
    }
  }

  return {
    schemaVersion: dataset.schemaVersion,
    source: {
      name: dataset.source.name,
      packageVersion: dataset.source.packageVersion,
      standard: dataset.source.standard,
    },
    generatedAt: dataset.generatedAt,
    jurisdictions,
  };
}

function validateLegalJurisdictionRecord(jurisdiction) {
  if (
    !jurisdiction ||
    typeof jurisdiction !== "object" ||
    Array.isArray(jurisdiction)
  ) {
    throw new Error("Invalid legal jurisdiction record.");
  }

  for (const field of ["id", "name", "level", "countryCode"]) {
    if (
      typeof jurisdiction[field] !== "string" ||
      jurisdiction[field].trim().length === 0
    ) {
      throw new Error(
        `Invalid legal jurisdiction record ${field}.`,
      );
    }
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

function cloneLegalJurisdictionRecord(jurisdiction) {
  return {
    ...jurisdiction,
  };
}

function loadLegalJurisdictions() {
  return loadLegalJurisdictionDataset().jurisdictions.map(
    cloneLegalJurisdictionRecord,
  );
}

module.exports = {
  loadLegalJurisdictionDataset,
  loadLegalJurisdictions,
  validateLegalJurisdictionDataset,
};
