"use strict";

class ServerLegalSourceDiscoveryProvider {
  constructor(options = {}) {
    if (
      !options.registry ||
      typeof options.registry.getByType !== "function" ||
      typeof options.registry.getByJurisdiction !== "function"
    ) {
      throw new Error("A valid legal source registry is required.");
    }

    this.registry = options.registry;
  }

  async discover(request) {
    const query = request?.query || {};
    const requestedTypes = Array.isArray(query.sources)
      ? query.sources
      : [];
    const requestedSourceTypes = new Set(requestedTypes);

    const sources = query.jurisdiction
      ? this.registry.getByJurisdiction(query.jurisdiction)
      : requestedTypes.flatMap((sourceType) =>
          this.registry.getByType(sourceType),
        );

    const candidates = sources
      .filter((source) => requestedSourceTypes.has(source.sourceType))
      .map((source) => ({
        id: source.id,
        title: source.title,
        sourceType: source.sourceType,
        jurisdiction: source.jurisdiction,
        authorityId: source.authorityId,
        authorityName: source.authorityName,
        sourceUrl: source.sourceUrl,
        citation: source.citation,
      }));

    return { candidates };
  }
}

class ServerLegalDocumentDiscoveryProvider {
  constructor(options = {}) {
    if (!options.registry || typeof options.registry.getById !== "function") {
      throw new Error("A valid source registry is required.");
    }

    if (!options.searchers || typeof options.searchers !== "object") {
      throw new Error("Legal document searchers are required.");
    }

    this.registry = options.registry;
    this.searchers = options.searchers;
  }

  async discover(request) {
    const query = request?.query || {};
    const requestedTypes = Array.isArray(query.sources)
      ? query.sources
      : [];
    const requestedSourceTypes = new Set(requestedTypes);

    const sources = query.jurisdiction
      ? this.registry.getByJurisdiction(query.jurisdiction)
      : requestedTypes.flatMap((sourceType) =>
          this.registry.getByType(sourceType),
        );

    const documents = [];
    const failures = [];

    for (const source of sources) {
      if (!requestedSourceTypes.has(source.sourceType)) {
        continue;
      }

      const searcher = this.searchers[source.id];

      if (typeof searcher !== "function") {
        failures.push({
          sourceId: source.id,
          error: "No document searcher is configured for this source.",
        });
        continue;
      }

      let results;

      try {
        results = await searcher({
          query: query.query,
          source,
        });
      } catch (error) {
        failures.push({
          sourceId: source.id,
          error:
            error instanceof Error
              ? error.message
              : String(error),
        });
        continue;
      }

      if (!Array.isArray(results)) {
        failures.push({
          sourceId: source.id,
          error: "Document searcher returned an invalid result.",
        });
        continue;
      }

      for (const result of results) {
        if (
          !result ||
          typeof result.id !== "string" ||
          typeof result.title !== "string" ||
          typeof result.documentUrl !== "string"
        ) {
          continue;
        }

        documents.push({
          id: result.id,
          sourceId: source.id,
          title: result.title,
          documentUrl: result.documentUrl,
          sourceType: source.sourceType,
          jurisdiction: source.jurisdiction,
          authorityId: source.authorityId,
          authorityName: source.authorityName,
          citation: result.citation,
          publishedAt: result.publishedAt,
          relevance: result.relevance,
          metadata: result.metadata,
        });
      }
    }

    return {
      documents,
      failures,
    };
  }
}

module.exports = {
  ServerLegalSourceDiscoveryProvider,
  ServerLegalDocumentDiscoveryProvider,
};
