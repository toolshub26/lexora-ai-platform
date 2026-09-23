"use strict";

class ServerLegalResearchOrchestrator {
  constructor(dependencies = {}) {
    if (
      !dependencies.retriever ||
      typeof dependencies.retriever.retrieve !== "function"
    ) {
      throw new Error("A valid legal source retriever is required.");
    }

    if (
      !dependencies.verifier ||
      typeof dependencies.verifier.verify !== "function"
    ) {
      throw new Error("A valid legal source verifier is required.");
    }

    this.discovery = dependencies.discovery;
    this.documentDiscovery = dependencies.documentDiscovery;
    this.retriever = dependencies.retriever;
    this.verifier = dependencies.verifier;
    this.synthesis = dependencies.synthesis;
  }

  async execute(request) {
    const startedAt = Date.now();

    const discovery = this.discovery
      ? await this.discovery.discover({
          query: request.query,
        })
      : undefined;

    const discoveredCandidates = discovery?.candidates ?? [];
    const seenCandidateIds = new Set();

    const candidates = discoveredCandidates.filter((candidate) => {
      if (!candidate || typeof candidate.id !== "string") {
        return false;
      }

      if (seenCandidateIds.has(candidate.id)) {
        return false;
      }

      seenCandidateIds.add(candidate.id);
      return true;
    });

    let retrievalCandidates = discovery ? candidates : undefined;

    if (this.documentDiscovery && discovery) {
      const documentDiscoveryResult =
        await this.documentDiscovery.discover({
          query: request.query,
          sources: candidates,
        });

      const discoveredDocuments =
        documentDiscoveryResult?.documents ?? [];

      const seenDocumentIds = new Set();

      retrievalCandidates = discoveredDocuments.filter((document) => {
        if (!document || typeof document.id !== "string") {
          return false;
        }

        if (seenDocumentIds.has(document.id)) {
          return false;
        }

        seenDocumentIds.add(document.id);
        return true;
      });
    }

    const retrieval = await this.retriever.retrieve({
      query: request.query,
      candidates: retrievalCandidates,
    });

    const verification = await this.verifier.verify({
      sources: retrieval.sources,
      evidence: retrieval.evidence,
      citations: retrieval.citations ?? [],
      fetches: retrieval.fetches ?? [],
    });

    let synthesis;

    if (this.synthesis) {
      const verifiedSourceIds = new Set(
        verification.verifications
          .filter(
            (item) => item.status === "verified",
          )
          .map((item) => item.sourceId),
      );

      const verifiedSources = retrieval.sources.filter(
        (source) => verifiedSourceIds.has(source.id),
      );

      const verifiedEvidence = retrieval.evidence.filter(
        (item) => verifiedSourceIds.has(item.sourceId),
      );

      const verifiedVerifications =
        verification.verifications.filter(
          (item) => verifiedSourceIds.has(item.sourceId),
        );

      const verifiedCitations = verification.citations.filter(
        (citation) => verifiedSourceIds.has(citation.sourceId),
      );

      synthesis = await this.synthesis.synthesize({
        query: request.query.query,
        sources: verifiedSources,
        evidence: verifiedEvidence,
        verifications: verifiedVerifications,
        citations: verifiedCitations,
      });

      const invalidCitationIds = validateLegalSynthesisCitations(
        synthesis.citationIds,
        verification.citations,
      );

      if (invalidCitationIds.length > 0) {
        throw new Error(
          "Legal synthesis returned invalid citation IDs: " +
            invalidCitationIds.join(", "),
        );
      }
    }

    const completedAt = new Date();

    const evidenceSet = {
      sources: retrieval.sources,
      evidence: retrieval.evidence,
      verifications: verification.verifications,
      citations: verification.citations,
    };

    const verificationBySourceId = new Map(
      verification.verifications.map((item) => [
        item.sourceId,
        item.status,
      ]),
    );

    const researchSources = retrieval.researchSources.map((source) => ({
      ...source,
      verificationStatus:
        verificationBySourceId.get(source.id) ?? "unverified",
    }));

    const research = {
      query: request.query.query,
      summary: synthesis?.summary || "",
      sources: researchSources,
      totalResults: researchSources.length,
      executionTimeMs: Date.now() - startedAt,
      completedAt,
      citations: verification.citations,
    };

    return {
      research,
      evidenceSet,
      retrieval,
      verification,
      synthesis,
    };
  }
}

function validateLegalSynthesisCitations(citationIds, citations) {
  const verifiedCitationIds = new Set(
    citations
      .filter((citation) => citation.verificationStatus === "verified")
      .map((citation) => citation.sourceId),
  );

  return citationIds.filter(
    (citationId) => !verifiedCitationIds.has(citationId),
  );
}

module.exports = {
  ServerLegalResearchOrchestrator,
};
