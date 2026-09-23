"use strict";

class ServerLegalSourceVerifier {
  constructor(options = {}) {
    this.authorityRegistry = options.authorityRegistry;
    this.jurisdictionRegistry = options.jurisdictionRegistry;
  }

  async verify(request) {
    const sources = Array.isArray(request?.sources)
      ? request.sources
      : [];

    const evidence = Array.isArray(request?.evidence)
      ? request.evidence
      : [];

    const citations = Array.isArray(request?.citations)
      ? request.citations
      : [];

    const fetches = Array.isArray(request?.fetches)
      ? request.fetches
      : [];

    const verifications = sources.map((source) =>
      this.verifySource({
        source,
        evidence,
        fetches,
      }),
    );

    const verificationBySourceId = new Map(
      verifications.map((verification) => [
        verification.sourceId,
        verification,
      ]),
    );

    return {
      verifications,
      citations: citations.map((citation) => {
        const verification = verificationBySourceId.get(
          citation.sourceId,
        );

        return {
          ...citation,
          verificationStatus:
            verification?.status === "verified"
              ? "verified"
              : "unverified",
        };
      }),
    };
  }

  verifySource({ source, evidence, fetches }) {
    const authority = this.resolveAuthority(source);
    const jurisdiction = this.resolveJurisdiction(source);

    const authorityConfirmed =
      Boolean(authority) &&
      Boolean(authority.active) &&
      authority.countryCode ===
        source.jurisdiction?.countryCode &&
      authority.jurisdictionId ===
        source.jurisdiction?.jurisdictionId;

    const jurisdictionConfirmed =
      Boolean(jurisdiction) &&
      Boolean(jurisdiction.active) &&
      jurisdiction.countryCode ===
        source.jurisdiction?.countryCode;

    const fetch = fetches.find(
      (candidate) => candidate?.sourceId === source.id,
    );

    const fetchConfirmed = this.isFetchConfirmed(
      source,
      fetch,
    );

    const evidenceConfirmed = evidence.some(
      (item) =>
        item &&
        item.sourceId === source.id &&
        typeof item.excerpt === "string" &&
        item.excerpt.trim().length > 0,
    );

    const verified =
      authorityConfirmed &&
      jurisdictionConfirmed &&
      fetchConfirmed &&
      evidenceConfirmed;

    if (!verified) {
      return {
        sourceId: source.id,
        status: "unverified",
        authorityConfirmed,
        jurisdictionConfirmed,
      };
    }

    return {
      sourceId: source.id,
      status: "verified",
      verifiedAt: new Date(),
      verifiedUrl: fetch.finalUrl,
      verifiedTitle: source.title,
      authorityConfirmed: true,
      jurisdictionConfirmed: true,
    };
  }

  resolveAuthority(source) {
    if (
      !this.authorityRegistry ||
      typeof this.authorityRegistry.getById !== "function" ||
      typeof source?.authorityId !== "string"
    ) {
      return undefined;
    }

    return this.authorityRegistry.getById(
      source.authorityId,
    );
  }

  resolveJurisdiction(source) {
    if (
      !this.jurisdictionRegistry ||
      typeof this.jurisdictionRegistry.getById !== "function"
    ) {
      return undefined;
    }

    const jurisdictionId =
      source?.jurisdiction?.jurisdictionId;

    if (typeof jurisdictionId !== "string") {
      return undefined;
    }

    return this.jurisdictionRegistry.getById(
      jurisdictionId,
    );
  }

  isFetchConfirmed(source, fetch) {
    if (!fetch) {
      return false;
    }

    if (
      typeof fetch.status !== "number" ||
      fetch.status < 200 ||
      fetch.status >= 300
    ) {
      return false;
    }

    if (
      typeof fetch.finalUrl !== "string" ||
      fetch.finalUrl.trim().length === 0
    ) {
      return false;
    }

    if (source?.id === "portal:in:supreme-court" && fetch.sciJudgmentId) {
      const sciJudgmentId = String(fetch.sciJudgmentId || "").trim();

      if (!sciJudgmentId) {
        return false;
      }

      if (fetch.judgmentIdentityVerified !== true) {
        return false;
      }

      if (
        typeof fetch.matchedCount !== "number" ||
        fetch.matchedCount < 2
      ) {
        return false;
      }

      try {
        const url = new URL(fetch.finalUrl);

        if (url.protocol !== "https:") {
          return false;
        }
      } catch {
        return false;
      }

      return true;
    }

    const registeredUrls = [
      source?.sourceUrl,
      source?.canonicalUrl,
    ].filter(
      (url) =>
        typeof url === "string" &&
        url.trim().length > 0,
    );

    return registeredUrls.includes(fetch.finalUrl);
  }
}

module.exports = {
  ServerLegalSourceVerifier,
};
