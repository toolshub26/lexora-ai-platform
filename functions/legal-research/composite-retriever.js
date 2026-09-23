"use strict";

class CompositeLegalDocumentRetriever {
  constructor(options = {}) {
    if (
      !options.genericRetriever ||
      typeof options.genericRetriever.retrieve !== "function"
    ) {
      throw new Error("A valid generic legal retriever is required.");
    }

    if (
      !options.supremeCourtRetriever ||
      typeof options.supremeCourtRetriever.retrieve !== "function"
    ) {
      throw new Error("A valid Supreme Court retriever is required.");
    }

    this.genericRetriever = options.genericRetriever;
    this.supremeCourtRetriever = options.supremeCourtRetriever;
  }

  async retrieve(request) {
    const candidates = Array.isArray(request?.candidates)
      ? request.candidates
      : [];

    const genericCandidates = candidates.filter(
      (candidate) =>
        candidate &&
        candidate.sourceId !== "portal:in:supreme-court",
    );

    const supremeCourtCandidates = candidates.filter(
      (candidate) =>
        candidate &&
        candidate.sourceId === "portal:in:supreme-court",
    );

    const results = await Promise.all([
      genericCandidates.length > 0
        ? this.genericRetriever.retrieve({
            ...request,
            candidates: genericCandidates,
          })
        : emptyRetrievalResult(),
      supremeCourtCandidates.length > 0
        ? this.supremeCourtRetriever.retrieve({
            ...request,
            candidates: supremeCourtCandidates,
          })
        : emptyRetrievalResult(),
    ]);

    return mergeRetrievalResults(results);
  }
}

function emptyRetrievalResult() {
  return {
    sources: [],
    evidence: [],
    researchSources: [],
    citations: [],
    fetches: [],
  };
}

function mergeRetrievalResults(results) {
  const merged = {
    sources: [],
    evidence: [],
    researchSources: [],
    citations: [],
    fetches: [],
  };

  for (const result of results) {
    if (!result) continue;

    merged.sources.push(...(result.sources || []));
    merged.evidence.push(...(result.evidence || []));
    merged.researchSources.push(...(result.researchSources || []));
    merged.citations.push(...(result.citations || []));
    merged.fetches.push(...(result.fetches || []));

    if (Array.isArray(result.unresolved)) {
      if (!merged.unresolved) merged.unresolved = [];
      merged.unresolved.push(...result.unresolved);
    }
  }

  return merged;
}

module.exports = {
  CompositeLegalDocumentRetriever,
};
