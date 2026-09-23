"use strict";

const fs = require("node:fs");
const path = require("node:path");

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

function loadLegalSourceDataset() {
  const datasetPath = path.resolve(
    __dirname,
    "../../data/legal_sources.json",
  );

  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  } catch (error) {
    throw new Error(
      `Failed to load legal source dataset: ${error.message}`,
    );
  }

  return validateLegalSourceDataset(parsed);
}

function validateLegalSourceDataset(dataset) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset)
  ) {
    throw new Error("Invalid legal source dataset.");
  }

  if (
    typeof dataset.schemaVersion !== "string" ||
    dataset.schemaVersion.trim().length === 0
  ) {
    throw new Error("Invalid legal source dataset schemaVersion.");
  }

  if (!dataset.source || typeof dataset.source !== "object") {
    throw new Error("Invalid legal source dataset provenance.");
  }

  for (const field of ["name", "version", "standard"]) {
    if (
      typeof dataset.source[field] !== "string" ||
      dataset.source[field].trim().length === 0
    ) {
      throw new Error(
        `Invalid legal source dataset provenance field "${field}".`,
      );
    }
  }

  if (
    typeof dataset.generatedAt !== "string" ||
    Number.isNaN(Date.parse(dataset.generatedAt))
  ) {
    throw new Error("Invalid legal source dataset generatedAt.");
  }

  if (!Array.isArray(dataset.sources)) {
    throw new Error("Legal source dataset sources must be an array.");
  }

  const seenIds = new Set();
  const sources = [];

  for (const source of dataset.sources) {
    validateLegalSourceRecord(source);

    if (seenIds.has(source.id)) {
      throw new Error(
        `Duplicate legal source id "${source.id}" found in dataset.`,
      );
    }

    seenIds.add(source.id);
    sources.push(cloneSourceRecord(source));
  }

  return {
    schemaVersion: dataset.schemaVersion,
    source: {
      name: dataset.source.name,
      version: dataset.source.version,
      standard: dataset.source.standard,
    },
    generatedAt: dataset.generatedAt,
    sources,
  };
}

function validateLegalSourceRecord(source) {
  if (
    !source ||
    typeof source !== "object" ||
    Array.isArray(source)
  ) {
    throw new Error("Invalid legal source record.");
  }

  for (const field of ["id", "title", "citation"]) {
    if (
      typeof source[field] !== "string" ||
      source[field].trim().length === 0
    ) {
      throw new Error(`Invalid legal source record ${field}.`);
    }
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

  if (
    typeof source.retrievedAt !== "string" ||
    Number.isNaN(Date.parse(source.retrievedAt))
  ) {
    throw new Error("Invalid legal source record retrievedAt.");
  }

  validateOptionalHttpsUrl(source.sourceUrl, "sourceUrl");
  validateOptionalHttpsUrl(source.canonicalUrl, "canonicalUrl");

  if (source.jurisdiction !== undefined) {
    validateJurisdiction(source.jurisdiction);
  }

  for (const field of ["authorityId", "authorityName"]) {
    if (
      source[field] !== undefined &&
      typeof source[field] !== "string"
    ) {
      throw new Error(`Invalid legal source ${field}.`);
    }
  }

  for (const field of [
    "publishedAt",
    "effectiveFrom",
    "effectiveTo",
  ]) {
    if (
      source[field] !== undefined &&
      (
        typeof source[field] !== "string" ||
        Number.isNaN(Date.parse(source[field]))
      )
    ) {
      throw new Error(`Invalid legal source ${field}.`);
    }
  }

  if (
    source.effectiveFrom !== undefined &&
    source.effectiveTo !== undefined &&
    Date.parse(source.effectiveFrom) > Date.parse(source.effectiveTo)
  ) {
    throw new Error(
      `Invalid legal source "${source.id}" effective date range.`,
    );
  }
}

function validateJurisdiction(jurisdiction) {
  if (
    !jurisdiction ||
    typeof jurisdiction !== "object" ||
    Array.isArray(jurisdiction)
  ) {
    throw new Error("Invalid legal source jurisdiction.");
  }

  for (const field of [
    "countryCode",
    "jurisdictionId",
    "authorityId",
  ]) {
    if (
      jurisdiction[field] !== undefined &&
      typeof jurisdiction[field] !== "string"
    ) {
      throw new Error(
        `Invalid legal source jurisdiction.${field}.`,
      );
    }
  }
}

function validateOptionalHttpsUrl(value, fieldName) {
  if (value === undefined) {
    return;
  }

  if (typeof value !== "string") {
    throw new Error(`Invalid legal source ${fieldName}.`);
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid legal source ${fieldName}.`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `Legal source ${fieldName} must use HTTPS.`,
    );
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      `Legal source ${fieldName} must not contain credentials.`,
    );
  }
}

function cloneSourceRecord(source) {
  return {
    ...source,
    jurisdiction: source.jurisdiction
      ? { ...source.jurisdiction }
      : undefined,
    retrievedAt: new Date(source.retrievedAt),
    publishedAt:
      source.publishedAt !== undefined
        ? new Date(source.publishedAt)
        : undefined,
    effectiveFrom:
      source.effectiveFrom !== undefined
        ? new Date(source.effectiveFrom)
        : undefined,
    effectiveTo:
      source.effectiveTo !== undefined
        ? new Date(source.effectiveTo)
        : undefined,
  };
}

function loadLegalSources() {
  const dataset = loadLegalSourceDataset();

  return dataset.sources.map(cloneSourceRecord);
}

module.exports = {
  loadLegalSourceDataset,
  loadLegalSources,
  validateLegalSourceDataset,
};
