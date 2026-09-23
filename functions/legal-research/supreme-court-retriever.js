"use strict";

class SupremeCourtDocumentRetriever {
  constructor(options = {}) {
    if (
      !options.locator ||
      typeof options.locator.locate !== "function"
    ) {
      throw new Error("A valid Supreme Court judgment locator is required.");
    }

    if (
      !options.resolver ||
      typeof options.resolver.resolve !== "function"
    ) {
      throw new Error("A valid Supreme Court judgment resolver is required.");
    }

    this.locator = options.locator;
    this.resolver = options.resolver;
  }

  async retrieve(request) {
    const candidates = Array.isArray(request?.candidates)
      ? request.candidates
      : [];

    const sources = [];
    const evidence = [];
    const researchSources = [];
    const citations = [];
    const fetches = [];
    const unresolved = [];

    for (const candidate of candidates) {
      if (
        !candidate ||
        candidate.sourceId !== "portal:in:supreme-court"
      ) {
        continue;
      }

      const mapping = await this.locator.locate(candidate);

      if (!mapping?.sciJudgmentId) {
        unresolved.push({
          documentId: candidate.id,
          reason: "Authoritative SCI judgment ID is unavailable.",
        });
        continue;
      }

      const resolvedDocument = {
        ...candidate,
        metadata: {
          ...(candidate.metadata || {}),
          sciJudgmentId: String(mapping.sciJudgmentId),
        },
      };

        const resolved = await this.resolver.resolve(resolvedDocument);

        if (!resolved?.verified) {
          unresolved.push({
            documentId: candidate.id,
            reason: "Official SCI judgment could not be verified.",
          });
          continue;
        }

        const sourceId = candidate.sourceId;
        const evidenceId = `${sourceId}:full-text`;
        const sourceUrl = String(
          resolved.url || resolved.finalUrl || candidate.documentUrl || "",
        );
        const excerpt = String(resolved.extractedText || "").trim();

        sources.push({
          id: sourceId,
          title: candidate.title,
          citation: candidate.citation,
          sourceType: candidate.sourceType,
          jurisdiction: candidate.jurisdiction,
          authorityId: candidate.authorityId,
          authorityName: candidate.authorityName,
          sourceUrl,
          canonicalUrl: sourceUrl,
          publishedAt: candidate.publishedAt,
          metadata: {
            ...(candidate.metadata || {}),
            sciJudgmentId: String(mapping.sciJudgmentId),
            mappingSource: mapping.mappingSource || "external-provider",
            verification: resolved.verification || null,
          },
        });

        evidence.push({
          id: evidenceId,
          sourceId,
          excerpt,
          fullText: excerpt,
          verified: true,
          verification: resolved.verification || null,
        });

        researchSources.push({
          id: resolved.id
            ? String(resolved.id)
            : String(mapping.sciJudgmentId),
          title: candidate.title,
          citation: candidate.citation,
          sourceType: candidate.sourceType,
          jurisdictionId: candidate.jurisdiction?.jurisdictionId,
          authorityId: candidate.authorityId,
          authorityName: candidate.authorityName,
          sourceUrl,
          verificationStatus: "verified",
        });

        citations.push({
          sourceId,
          evidenceId,
          citation: candidate.citation,
          verificationStatus: "unverified",
        });

        fetches.push({
          sourceId,
          status: Number(resolved.status || 200),
          contentType: resolved.contentType || "application/pdf",
          finalUrl: sourceUrl,
          sciJudgmentId: String(mapping.sciJudgmentId),
          judgmentIdentityVerified: resolved.verification?.verified === true,
          matchedCount: Number(resolved.verification?.matchedCount || 0),
          judgmentIdentityMatches: resolved.verification?.matches || null,
        });
      }

    return {
      sources,
      evidence,
      researchSources,
      citations,
      fetches,
      unresolved,
    };
  }
}

module.exports = {
  SupremeCourtDocumentRetriever,
};
