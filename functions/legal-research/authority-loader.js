"use strict";

const fs = require("node:fs");
const path = require("node:path");

const LEGAL_AUTHORITY_TYPES = new Set([
  "court",
  "tribunal",
  "administrative-authority",
  "legislative-body",
  "regulatory-authority",
  "other",
]);

function loadLegalAuthorityDataset() {
  const datasetPath = path.resolve(
    __dirname,
    "../../data/legal_authorities.json",
  );

  let parsed;

  try {
    parsed = JSON.parse(fs.readFileSync(datasetPath, "utf8"));
  } catch (error) {
    throw new Error(
      `Failed to load legal authority dataset: ${error.message}`,
    );
  }

  return validateLegalAuthorityDataset(parsed);
}

function validateLegalAuthorityDataset(dataset) {
  if (
    !dataset ||
    typeof dataset !== "object" ||
    Array.isArray(dataset)
  ) {
    throw new Error("Invalid legal authority dataset.");
  }

  if (
    typeof dataset.schemaVersion !== "string" ||
    dataset.schemaVersion.trim().length === 0
  ) {
    throw new Error("Invalid legal authority dataset schemaVersion.");
  }

  if (!dataset.source || typeof dataset.source !== "object") {
    throw new Error("Invalid legal authority dataset provenance.");
  }

  for (const field of ["name", "version", "standard"]) {
    if (
      typeof dataset.source[field] !== "string" ||
      dataset.source[field].trim().length === 0
    ) {
      throw new Error(
        `Invalid legal authority dataset provenance field "${field}".`,
      );
    }
  }

  if (
    typeof dataset.generatedAt !== "string" ||
    Number.isNaN(Date.parse(dataset.generatedAt))
  ) {
    throw new Error("Invalid legal authority dataset generatedAt.");
  }

  if (!Array.isArray(dataset.authorities)) {
    throw new Error(
      "Legal authority dataset authorities must be an array.",
    );
  }

  const seenIds = new Set();
  const authorities = [];

  for (const authority of dataset.authorities) {
    validateLegalAuthorityRecord(authority);

    if (seenIds.has(authority.id)) {
      throw new Error(
        `Duplicate legal authority id "${authority.id}" found in dataset.`,
      );
    }

    seenIds.add(authority.id);
    authorities.push(cloneLegalAuthorityRecord(authority));
  }

  for (const authority of dataset.authorities) {
    if (
      authority.parentAuthorityId &&
      !seenIds.has(authority.parentAuthorityId)
    ) {
      throw new Error(
        `Legal authority "${authority.id}" references missing parent "${authority.parentAuthorityId}".`,
      );
    }
  }

  return {
    schemaVersion: dataset.schemaVersion,
    source: {
      name: dataset.source.name,
      version: dataset.source.version,
      standard: dataset.source.standard,
    },
    generatedAt: dataset.generatedAt,
    authorities,
  };
}

function validateLegalAuthorityRecord(authority) {
  if (
    !authority ||
    typeof authority !== "object" ||
    Array.isArray(authority)
  ) {
    throw new Error("Invalid legal authority record.");
  }

  for (const field of ["id", "name", "countryCode"]) {
    if (
      typeof authority[field] !== "string" ||
      authority[field].trim().length === 0
    ) {
      throw new Error(`Invalid legal authority record ${field}.`);
    }
  }

  if (!LEGAL_AUTHORITY_TYPES.has(authority.type)) {
    throw new Error("Invalid legal authority record type.");
  }

  for (const field of [
    "jurisdictionId",
    "parentAuthorityId",
    "officialName",
  ]) {
    if (
      authority[field] !== undefined &&
      typeof authority[field] !== "string"
    ) {
      throw new Error(`Invalid legal authority ${field}.`);
    }
  }

  if (authority.officialUrl !== undefined) {
    validateOptionalHttpsUrl(authority.officialUrl, "officialUrl");
  }

  if (typeof authority.active !== "boolean") {
    throw new Error("Invalid legal authority active.");
  }
}

function validateOptionalHttpsUrl(value, fieldName) {
  if (typeof value !== "string") {
    throw new Error(`Invalid legal authority ${fieldName}.`);
  }

  let parsed;

  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`Invalid legal authority ${fieldName}.`);
  }

  if (parsed.protocol !== "https:") {
    throw new Error(
      `Legal authority ${fieldName} must use HTTPS.`,
    );
  }

  if (parsed.username || parsed.password) {
    throw new Error(
      `Legal authority ${fieldName} must not contain credentials.`,
    );
  }
}

function cloneLegalAuthorityRecord(authority) {
  return {
    ...authority,
  };
}

function loadLegalAuthorities() {
  const dataset = loadLegalAuthorityDataset();

  return dataset.authorities.map(cloneLegalAuthorityRecord);
}

module.exports = {
  loadLegalAuthorityDataset,
  loadLegalAuthorities,
  validateLegalAuthorityDataset,
};
