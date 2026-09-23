"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalSourceRegistry,
} = require("./registry");

const {
  ServerLegalSourceRetriever,
} = require("./retriever");

const {
  ServerLegalSourceVerifier,
} = require("./verifier");

const {
  ServerLegalResearchOrchestrator,
} = require("./orchestrator");

const {
  ServerLegalResearchService,
} = require("./service");

test("server legal research pipeline connects service through orchestrator, retrieval, and verification", async () => {
  const retrievedAt = new Date();

  const source = {
    id: "synthetic-case-source",
    title: "Synthetic Legal Case Source",
    citation: "Synthetic Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    authorityId: "synthetic-authority",
    authorityName: "Synthetic Authority",
    sourceUrl: "https://example.com/legal-case",
    availability: "available",
    retrievedAt,
  };

  const registry = new ServerLegalSourceRegistry([source]);

  const fetcher = {
    async fetch(request) {
      assert.equal(request.url, "https://example.com/legal-case");

      return {
        statusCode: 200,
        headers: {
          "content-type": "text/html",
        },
        body: "<html><body>Synthetic legal evidence.</body></html>",
      };
    },
  };

  const discovery = {
    async discover() {
      return {
        candidates: [
          {
            id: source.id,
            title: source.title,
            sourceType: source.sourceType,
            authorityId: source.authorityId,
            authorityName: source.authorityName,
            sourceUrl: source.sourceUrl,
            citation: source.citation,
          },
        ],
      };
    },
  };

  const retriever = new ServerLegalSourceRetriever({
    registry,
    fetcher,
  });

  const verifier = new ServerLegalSourceVerifier();

  const orchestrator = new ServerLegalResearchOrchestrator({
    discovery,
    retriever,
    verifier,
  });

  const service = new ServerLegalResearchService({
    orchestrator,
  });

  const result = await service.research({
    query: {
      query: "Synthetic legal research",
      sources: ["cases"],
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "india",
      },
    },
  });

  assert.equal(result.research.query, "Synthetic legal research");

  assert.equal(result.retrieval.sources.length, 1);
  assert.equal(
    result.retrieval.sources[0].id,
    "synthetic-case-source",
  );

  assert.equal(result.retrieval.evidence.length, 1);
  assert.equal(
    result.retrieval.evidence[0].sourceId,
    "synthetic-case-source",
  );

  assert.equal(result.verification.verifications.length, 1);
  assert.equal(
    result.verification.verifications[0].status,
    "unverified",
  );

  assert.equal(result.research.sources.length, 1);
  assert.equal(result.research.totalResults, 1);

  assert.equal(result.evidenceSet.sources.length, 1);
  assert.equal(result.evidenceSet.evidence.length, 1);
  assert.equal(result.evidenceSet.verifications.length, 1);
});

test("canonical source pipeline remains fail-closed at verification", async () => {
  const registry = new ServerLegalSourceRegistry();

  const fetcher = {
    async fetch(request) {
      return {
        status: 200,
        contentType: "text/html",
        finalUrl: request.url,
        body: "<html><body>Official source evidence.</body></html>",
      };
    },
  };

  const discovery = {
    async discover() {
      return {
        candidates: [
          {
            id: "portal:in:supreme-court",
            title: "Supreme Court of India",
            sourceType: "official-publications",
          },
        ],
      };
    },
  };

  const retriever = new ServerLegalSourceRetriever({
    registry,
    fetcher,
  });

  const verifier = new ServerLegalSourceVerifier();

  const orchestrator = new ServerLegalResearchOrchestrator({
    discovery,
    retriever,
    verifier,
  });

  const result = await orchestrator.execute({
    query: {
      query: "Indian Supreme Court legal research",
      sources: ["official-publications"],
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
    },
  });

  assert.equal(result.retrieval.sources.length, 1);
  assert.equal(
    result.retrieval.sources[0].id,
    "portal:in:supreme-court",
  );

  assert.equal(result.retrieval.evidence.length, 1);

  assert.equal(result.verification.verifications.length, 1);
  assert.equal(
    result.verification.verifications[0].sourceId,
    "portal:in:supreme-court",
  );
  assert.equal(
    result.verification.verifications[0].status,
    "unverified",
  );
});

test("canonical source pipeline verifies a source when authority, jurisdiction, fetch, and evidence checks pass", async () => {
  const sourceRegistry = new ServerLegalSourceRegistry();

  const jurisdictionRegistry =
    new (require("./jurisdiction-registry").ServerLegalJurisdictionRegistry)();

  const authorityRegistry =
    new (require("./authority-registry").ServerLegalAuthorityRegistry)(
      undefined,
      jurisdictionRegistry,
    );

  const source = sourceRegistry.getById(
    "portal:in:supreme-court",
  );

  assert.ok(source);
  assert.equal(source.authorityId, "court:in:supreme-court");
  assert.equal(source.jurisdiction.jurisdictionId, "country:IN");

  const fetcher = {
    async fetch(request) {
      assert.equal(request.url, source.sourceUrl);

      return {
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
        body: "<html><body>Official Supreme Court source evidence.</body></html>",
      };
    },
  };

  const retriever = new ServerLegalSourceRetriever({
    registry: sourceRegistry,
    fetcher,
  });

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry,
    jurisdictionRegistry,
  });

  const discovery = {
    async discover() {
      return {
        candidates: [
          {
            id: source.id,
            title: source.title,
            sourceType: source.sourceType,
            jurisdiction: source.jurisdiction,
            authorityId: source.authorityId,
            authorityName: source.authorityName,
            sourceUrl: source.sourceUrl,
            citation: source.citation,
          },
        ],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    discovery,
    retriever,
    verifier,
  });

  const service = new ServerLegalResearchService({
    orchestrator,
  });

  const result = await service.research({
    query: {
      query: "Indian Supreme Court legal research",
      sources: ["official-publications"],
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
    },
  });

  assert.equal(result.retrieval.sources.length, 1);
  assert.equal(
    result.retrieval.sources[0].id,
    "portal:in:supreme-court",
  );

  assert.equal(result.retrieval.evidence.length, 1);

  assert.equal(result.verification.verifications.length, 1);
  assert.equal(
    result.verification.verifications[0].sourceId,
    "portal:in:supreme-court",
  );
  assert.equal(
    result.verification.verifications[0].status,
    "verified",
  );
  assert.equal(
    result.verification.verifications[0].authorityConfirmed,
    true,
  );
  assert.equal(
    result.verification.verifications[0].jurisdictionConfirmed,
    true,
  );

  assert.equal(result.evidenceSet.verifications.length, 1);
  assert.equal(
    result.evidenceSet.verifications[0].status,
    "verified",
  );
});
