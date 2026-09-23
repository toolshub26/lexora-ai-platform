"use strict";

class ServerLegalSynthesisProvider {
  constructor(options = {}) {
    if (
      !options.generate ||
      typeof options.generate !== "function"
    ) {
      throw new Error(
        "A valid legal synthesis generator is required.",
      );
    }

    this.generate = options.generate;
  }

  async synthesize(input) {
    const sources = Array.isArray(input?.sources)
      ? input.sources
      : [];

    const evidence = Array.isArray(input?.evidence)
      ? input.evidence
      : [];

    const verifications = Array.isArray(input?.verifications)
      ? input.verifications
      : [];

    const citations = Array.isArray(input?.citations)
      ? input.citations
      : [];

    const verifiedSourceIds = new Set(
      verifications
        .filter(
          (verification) =>
            verification.status === "verified",
        )
        .map(
          (verification) => verification.sourceId,
        ),
    );

    const verifiedSources = sources.filter(
      (source) => verifiedSourceIds.has(source.id),
    );

    const verifiedEvidence = evidence.filter(
      (item) => verifiedSourceIds.has(item.sourceId),
    );

    const verifiedVerifications =
      verifications.filter(
        (verification) =>
          verifiedSourceIds.has(verification.sourceId),
      );

    const verifiedCitations = citations.filter(
      (citation) =>
        verifiedSourceIds.has(citation.sourceId) &&
        citation.verificationStatus === "verified",
    );

    if (
      verifiedSources.length === 0 ||
      verifiedEvidence.length === 0
    ) {
      return {
        summary:
          "No verified legal evidence is available for synthesis.",
        citationIds: [],
      };
    }

    const generated = await this.generate({
      query:
        typeof input?.query === "string"
          ? input.query
          : "",
      sources: verifiedSources,
      evidence: verifiedEvidence,
      verifications: verifiedVerifications,
      citations: verifiedCitations,
    });

    if (
      !generated ||
      typeof generated !== "object" ||
      typeof generated.summary !== "string"
    ) {
      throw new Error(
        "Legal synthesis generator returned an invalid result.",
      );
    }

    const citationIds = Array.isArray(
      generated.citationIds,
    )
      ? generated.citationIds.filter(
          (citationId) =>
            typeof citationId === "string" &&
            verifiedSourceIds.has(citationId),
        )
      : [];

    return {
      summary: generated.summary.trim(),
      citationIds,
    };
  }
}

module.exports = {
  ServerLegalSynthesisProvider,
};
