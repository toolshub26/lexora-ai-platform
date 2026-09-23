"use strict";

const { loadLegalAuthorities } = require("./authority-loader");

const LEGAL_AUTHORITY_TYPES = new Set([
  "court",
  "tribunal",
  "administrative-authority",
  "legislative-body",
  "regulatory-authority",
  "other",
]);

class ServerLegalAuthorityRegistry {
  constructor(authorities, jurisdictionRegistry) {
    const resolvedAuthorities =
      authorities === undefined ? loadLegalAuthorities() : authorities;

    if (!Array.isArray(resolvedAuthorities)) {
      throw new Error(
        "Legal authority registry authorities must be an array.",
      );
    }

    const seenIds = new Set();
    const normalizedAuthorities = [];

    for (const authority of resolvedAuthorities) {
      validateAuthorityRecord(authority);

      if (seenIds.has(authority.id)) {
        throw new Error(
          `Duplicate legal authority id "${authority.id}" found in authority registry.`,
        );
      }

      if (
        authority.jurisdictionId &&
        jurisdictionRegistry &&
        typeof jurisdictionRegistry.getById === "function" &&
        !jurisdictionRegistry.getById(authority.jurisdictionId)
      ) {
        throw new Error(
          `Legal authority "${authority.id}" references unknown jurisdiction "${authority.jurisdictionId}".`,
        );
      }

      seenIds.add(authority.id);
      normalizedAuthorities.push(cloneAuthorityRecord(authority));
    }

    this.authorities = Object.freeze(normalizedAuthorities);
  }

  getById(id) {
    return this.authorities.find(
      (authority) => authority.id === id,
    );
  }

  getByJurisdiction(jurisdictionId) {
    return this.authorities.filter(
      (authority) =>
        authority.jurisdictionId === jurisdictionId,
    );
  }

  getByCountry(countryCode) {
    const normalizedCode =
      typeof countryCode === "string"
        ? countryCode.trim().toUpperCase()
        : "";

    return this.authorities.filter(
      (authority) =>
        authority.countryCode === normalizedCode,
    );
  }
}

function validateAuthorityRecord(authority) {
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
    "officialUrl",
  ]) {
    if (
      authority[field] !== undefined &&
      typeof authority[field] !== "string"
    ) {
      throw new Error(`Invalid legal authority ${field}.`);
    }
  }

  if (typeof authority.active !== "boolean") {
    throw new Error("Invalid legal authority active.");
  }
}

function cloneAuthorityRecord(authority) {
  return {
    ...authority,
  };
}

module.exports = {
  ServerLegalAuthorityRegistry,
};
