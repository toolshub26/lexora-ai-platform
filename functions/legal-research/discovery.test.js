"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalSourceDiscoveryProvider,
} = require("./discovery");

const {
  ServerLegalSourceRegistry,
} = require("./registry");

test("server discovery requires a source registry", () => {
  assert.throws(
    () => new ServerLegalSourceDiscoveryProvider(),
    /valid legal source registry/,
  );
});

test("server discovery returns matching registry sources", async () => {
  const registry = new ServerLegalSourceRegistry([
    {
      id: "source-1",
      title: "Synthetic Case Source",
      citation: "Synthetic Citation",
      sourceType: "cases",
      authorityLevel: "primary",
      authorityId: "authority-1",
      authorityName: "Synthetic Authority",
      sourceUrl: "https://example.com/case",
      availability: "available",
      retrievedAt: new Date(),
    },
    {
      id: "source-2",
      title: "Synthetic Statute Source",
      citation: "Synthetic Statute",
      sourceType: "statutes",
      authorityLevel: "primary",
      authorityId: "authority-2",
      authorityName: "Synthetic Authority 2",
      sourceUrl: "https://example.com/statute",
      availability: "available",
      retrievedAt: new Date(),
    },
  ]);

  const provider = new ServerLegalSourceDiscoveryProvider({
    registry,
  });

  const result = await provider.discover({
    query: {
      query: "Synthetic legal research",
      sources: ["cases"],
    },
  });

  assert.equal(result.candidates.length, 1);
  assert.equal(result.candidates[0].id, "source-1");
  assert.equal(result.candidates[0].sourceType, "cases");
});

test("server discovery returns no candidates when registry has no matching sources", async () => {
  const registry = new ServerLegalSourceRegistry([
    {
      id: "source-1",
      title: "Synthetic Statute Source",
      citation: "Synthetic Statute",
      sourceType: "statutes",
      authorityLevel: "primary",
      sourceUrl: "https://example.com/statute",
      availability: "available",
      retrievedAt: new Date(),
    },
  ]);

  const provider = new ServerLegalSourceDiscoveryProvider({
    registry,
  });

  const result = await provider.discover({
    query: {
      query: "Synthetic case research",
      sources: ["cases"],
    },
  });

  assert.deepEqual(result, {
    candidates: [],
  });
});

test("filters discovered sources by jurisdiction before source type filtering", async () => {
  const sources = [
    {
      id: "india-case-1",
      title: "India Case",
      sourceType: "cases",
      jurisdiction: { countryCode: "IN", jurisdictionId: "IN" },
      authorityId: "court-in",
      authorityName: "India Court",
      sourceUrl: "https://example.com/india-case",
      citation: "India Case 1",
      availability: "available",
      retrievedAt: new Date(),
    },
    {
      id: "us-case-1",
      title: "US Case",
      sourceType: "cases",
      jurisdiction: { countryCode: "US", jurisdictionId: "US" },
      authorityId: "court-us",
      authorityName: "US Court",
      sourceUrl: "https://example.com/us-case",
      citation: "US Case 1",
      availability: "available",
      retrievedAt: new Date(),
    },
    {
      id: "india-statute-1",
      title: "India Statute",
      sourceType: "statutes",
      jurisdiction: { countryCode: "IN", jurisdictionId: "IN" },
      authorityId: "legislature-in",
      authorityName: "India Legislature",
      sourceUrl: "https://example.com/india-statute",
      citation: "India Statute 1",
      availability: "available",
      retrievedAt: new Date(),
    },
  ];

  const registry = {
    getByJurisdiction(jurisdiction) {
      assert.deepEqual(jurisdiction, {
        countryCode: "IN",
        jurisdictionId: "IN",
      });

      return sources.filter(
        (source) => source.jurisdiction?.countryCode === "IN",
      );
    },

    getByType(sourceType) {
      return sources.filter((source) => source.sourceType === sourceType);
    },
  };

  const provider = new ServerLegalSourceDiscoveryProvider({ registry });

  const result = await provider.discover({
    query: {
      query: "test",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "IN",
      },
      sources: ["cases"],
    },
  });

  assert.deepEqual(
    result.candidates.map((candidate) => candidate.id),
    ["india-case-1"],
  );
});

test("returns no candidates when sources are empty", async () => {
  const registry = {
    getByJurisdiction() {
      throw new Error("getByJurisdiction should not be called");
    },
    getByType() {
      throw new Error("getByType should not be called");
    },
  };

  const provider = new ServerLegalSourceDiscoveryProvider({ registry });

  const result = await provider.discover({
    query: {
      query: "test",
      sources: [],
    },
  });

  assert.deepEqual(result, { candidates: [] });
});

test("returns no candidates when sources are missing", async () => {
  const registry = {
    getByJurisdiction() {
      throw new Error("getByJurisdiction should not be called");
    },
    getByType() {
      throw new Error("getByType should not be called");
    },
  };

  const provider = new ServerLegalSourceDiscoveryProvider({ registry });

  const result = await provider.discover({
    query: {
      query: "test",
    },
  });

  assert.deepEqual(result, { candidates: [] });
});

test("filters multiple requested source types within a jurisdiction", async () => {
  const registry = {
    getByJurisdiction() {
      return [
        {
          id: "india-case",
          title: "India Case",
          sourceType: "cases",
          jurisdiction: { countryCode: "IN", jurisdictionId: "IN" },
        },
        {
          id: "india-statute",
          title: "India Statute",
          sourceType: "statutes",
          jurisdiction: { countryCode: "IN", jurisdictionId: "IN" },
        },
        {
          id: "india-regulation",
          title: "India Regulation",
          sourceType: "regulations",
          jurisdiction: { countryCode: "IN", jurisdictionId: "IN" },
        },
      ];
    },
    getByType() {
      throw new Error("getByType should not be called");
    },
  };

  const provider = new ServerLegalSourceDiscoveryProvider({ registry });

  const result = await provider.discover({
    query: {
      query: "test",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "IN",
      },
      sources: ["cases", "statutes"],
    },
  });

  assert.deepEqual(
    result.candidates.map((candidate) => candidate.id),
    ["india-case", "india-statute"],
  );
});

test("preserves registry ordering when duplicate source records are returned", async () => {
  const duplicateSource = {
    id: "india-case-1",
    title: "India Case",
    sourceType: "cases",
    jurisdiction: { countryCode: "IN", jurisdictionId: "IN" },
    authorityId: "court-in",
    authorityName: "India Court",
    sourceUrl: "https://example.com/india-case",
    citation: "India Case 1",
  };

  const registry = {
    getByJurisdiction() {
      return [duplicateSource, duplicateSource];
    },
    getByType() {
      throw new Error("getByType should not be called");
    },
  };

  const provider = new ServerLegalSourceDiscoveryProvider({ registry });

  const result = await provider.discover({
    query: {
      query: "test",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "IN",
      },
      sources: ["cases"],
    },
  });

  assert.deepEqual(
    result.candidates.map((candidate) => candidate.id),
    ["india-case-1", "india-case-1"],
  );
});

test("server discovery loads canonical sources from the default registry", async () => {
  const registry = new ServerLegalSourceRegistry();

  const provider = new ServerLegalSourceDiscoveryProvider({
    registry,
  });

  const result = await provider.discover({
    query: {
      query: "Indian legal research",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
      sources: ["official-publications"],
    },
  });

  assert.deepEqual(
    result.candidates.map((candidate) => candidate.id),
    [
      "portal:in:supreme-court",
      "portal:in:india-code",
    ],
  );
});

test("legal document candidate contract preserves document identity and trusted source binding", () => {
  const candidate = {
    id: "document:sc:2026:case-001",
    sourceId: "portal:in:supreme-court",
    title: "Synthetic Supreme Court Judgment",
    documentUrl: "https://www.sci.gov.in/example/judgment-001",
    sourceType: "cases",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    citation: "Synthetic Citation 2026",
    publishedAt: new Date("2026-01-15T00:00:00.000Z"),
    relevance: 0.95,
          metadata: {
            suplisCaseId: "19037",
            citations: ["1973 AIR 1461"],
          },
  };

  assert.equal(candidate.id, "document:sc:2026:case-001");
  assert.equal(candidate.sourceId, "portal:in:supreme-court");
  assert.equal(candidate.documentUrl, "https://www.sci.gov.in/example/judgment-001");
  assert.equal(candidate.sourceType, "cases");
  assert.equal(candidate.jurisdiction.jurisdictionId, "country:IN");
  assert.equal(candidate.authorityId, "court:in:supreme-court");
  assert.equal(candidate.citation, "Synthetic Citation 2026");
  assert.equal(candidate.relevance, 0.95);
});

test("server document discovery contract returns a document bound to a trusted source", async () => {
  const { ServerLegalDocumentDiscoveryProvider } = require("./discovery");

  const source = {
    id: "portal:in:supreme-court",
    title: "Supreme Court of India",
    sourceType: "cases",
    sourceUrl: "https://www.sci.gov.in/",
    canonicalUrl: "https://www.sci.gov.in/",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    citation: "Supreme Court of India",
    availability: "available",
    retrievedAt: new Date(),
  };

  const registry = {
    getById(id) {
      return id === source.id ? source : undefined;
    },

    getByType(sourceType) {
      return source.sourceType === sourceType ? [source] : [];
    },

    getByJurisdiction(jurisdiction) {
      return jurisdiction?.jurisdictionId ===
        source.jurisdiction.jurisdictionId
        ? [source]
        : [];
    },
  };

  const provider = new ServerLegalDocumentDiscoveryProvider({
    registry,
    searchers: {
      "portal:in:supreme-court": async () => [
        {
          id: "document:sc:2026:case-001",
          title: "Synthetic Supreme Court Judgment",
          documentUrl:
            "https://www.sci.gov.in/example/judgment-001",
          publishedAt: new Date("2026-01-15T00:00:00.000Z"),
          citation: "Synthetic Citation 2026",
          relevance: 0.95,
          metadata: {
            suplisCaseId: "19037",
            citations: ["1973 AIR 1461"],
          },
        },
      ],
    },
  });

  const result = await provider.discover({
    query: {
      query: "synthetic legal research query",
      sources: ["cases"],
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
    },
  });

  assert.equal(result.documents.length, 1);

  const document = result.documents[0];

  assert.equal(document.id, "document:sc:2026:case-001");
  assert.equal(document.sourceId, "portal:in:supreme-court");
  assert.deepEqual(document.metadata, {
    suplisCaseId: "19037",
    citations: ["1973 AIR 1461"],
  });
  assert.equal(
    document.documentUrl,
    "https://www.sci.gov.in/example/judgment-001",
  );
  assert.equal(document.sourceType, "cases");
  assert.equal(
    document.authorityId,
    "court:in:supreme-court",
  );
  assert.equal(
    document.jurisdiction.jurisdictionId,
    "country:IN",
  );
});

test("document discovery only searches eligible registered sources", async () => {
  const { ServerLegalDocumentDiscoveryProvider } = require("./discovery");

  const calls = [];

  const sources = {
    "portal:in:supreme-court": {
      id: "portal:in:supreme-court",
      title: "Supreme Court of India",
      sourceType: "cases",
      sourceUrl: "https://www.sci.gov.in/",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
      authorityId: "court:in:supreme-court",
      authorityName: "Supreme Court of India",
    },

    "portal:in:india-code": {
      id: "portal:in:india-code",
      title: "India Code",
      sourceType: "official-publications",
      sourceUrl: "https://www.indiacode.nic.in/",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
    },
  };

  const registry = {
    getById(id) {
      return sources[id];
    },

    getByType(sourceType) {
      return Object.values(sources).filter(
        (source) => source.sourceType === sourceType,
      );
    },

    getByJurisdiction(jurisdiction) {
      return Object.values(sources).filter(
        (source) =>
          source.jurisdiction?.jurisdictionId ===
          jurisdiction?.jurisdictionId,
      );
    },
  };

  const provider = new ServerLegalDocumentDiscoveryProvider({
    registry,
    searchers: {
      "portal:in:supreme-court": async ({ query, source }) => {
        calls.push({
          sourceId: source.id,
          query,
        });

        return [
          {
            id: "document:sc:2026:case-002",
            title: "Synthetic Supreme Court Judgment 2",
            documentUrl:
              "https://www.sci.gov.in/example/judgment-002",
            citation: "Synthetic Citation 2026-2",
            relevance: 0.91,
          },
        ];
      },

      "portal:in:india-code": async () => {
        throw new Error("India Code searcher must not be called.");
      },
    },
  });

  const result = await provider.discover({
    query: {
      query: "constitutional law",
      sources: ["cases"],
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
    },
  });

  assert.equal(result.documents.length, 1);
  assert.equal(
    result.documents[0].sourceId,
    "portal:in:supreme-court",
  );
  assert.equal(calls.length, 1);
  assert.equal(calls[0].sourceId, "portal:in:supreme-court");
  assert.equal(calls[0].query, "constitutional law");
});

test("document discovery uses registry sources even when a matching source has a registered searcher", async () => {
  const { ServerLegalDocumentDiscoveryProvider } = require("./discovery");

  const calls = [];

  const source = {
    id: "portal:in:supreme-court",
    title: "Supreme Court of India",
    sourceType: "cases",
    sourceUrl: "https://www.sci.gov.in/",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
  };

  const registry = {
    getById(id) {
      return id === source.id ? source : undefined;
    },

    getByType(sourceType) {
      return sourceType === "cases" ? [source] : [];
    },

    getByJurisdiction(jurisdiction) {
      return jurisdiction?.jurisdictionId === "country:IN"
        ? [source]
        : [];
    },
  };

  const provider = new ServerLegalDocumentDiscoveryProvider({
    registry,
    searchers: {
      [source.id]: async ({ source: trustedSource }) => {
        calls.push(trustedSource.id);

        return [
          {
            id: "document:sc:2026:case-003",
            title: "Synthetic Supreme Court Judgment 3",
            documentUrl:
              "https://www.sci.gov.in/example/judgment-003",
            relevance: 0.93,
          },
        ];
      },
    },
  });

  const result = await provider.discover({
    query: {
      query: "fundamental rights",
      sources: ["cases"],
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
    },
  });

  assert.equal(result.documents.length, 1);
  assert.equal(
    result.documents[0].sourceId,
    "portal:in:supreme-court",
  );
  assert.deepEqual(calls, ["portal:in:supreme-court"]);
});
