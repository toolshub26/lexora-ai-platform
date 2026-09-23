"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

test("server retriever fetches content using the canonical registry source URL", async () => {
  const {
    ServerLegalSourceRetriever,
  } = require("./retriever");

  const source = {
    id: "source-in-case-1",
    title: "Indian Supreme Court Case",
    citation: "Example Citation 2026",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "india",
    },
    authorityId: "supreme-court-india",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://legal.example.gov/case/1",
    availability: "available",
    retrievedAt: new Date(),
  };

  let fetchedRequest;

  const registry = {
    getById(id) {
      return id === source.id ? source : undefined;
    },
  };

  const fetcher = {
    async fetch(request) {
      fetchedRequest = request;

      return {
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
        body: "<html><body>Judgment text</body></html>",
      };
    },
  };

  const retriever = new ServerLegalSourceRetriever({
    registry,
    fetcher,
  });

  const result = await retriever.retrieve({
    candidates: [
      {
        id: source.id,
        title: "Client supplied title",
        sourceType: "cases",
        sourceUrl: "https://attacker.example/evil",
      },
    ],
  });

  assert.deepEqual(fetchedRequest, {
    url: source.sourceUrl,
  });

  assert.equal(result.sources.length, 1);
  assert.equal(result.sources[0].id, source.id);
  assert.equal(result.evidence.length, 1);
  assert.equal(result.evidence[0].sourceId, source.id);
  assert.equal(result.evidence[0].kind, "full-text");
  assert.equal(result.evidence[0].excerpt, "Judgment text");
  assert.equal(result.fetches.length, 1);
  assert.equal(result.fetches[0].sourceId, source.id);
  assert.equal(result.fetches[0].status, 200);
  assert.equal(result.fetches[0].contentType, "text/html");
  assert.equal(result.fetches[0].finalUrl, source.sourceUrl);
});

test("server retriever rejects a canonical source without a source URL", async () => {
  const {
    ServerLegalSourceRetriever,
  } = require("./retriever");

  const source = {
    id: "source-without-url",
    title: "Source Without URL",
    citation: "Example Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    availability: "available",
    retrievedAt: new Date(),
  };

  let fetchCalled = false;

  const retriever = new ServerLegalSourceRetriever({
    registry: {
      getById(id) {
        return id === source.id ? source : undefined;
      },
    },
    fetcher: {
      async fetch() {
        fetchCalled = true;
        throw new Error("Fetcher must not be called.");
      },
    },
  });

  await assert.rejects(
    retriever.retrieve({
      candidates: [{ id: source.id }],
    }),
    /does not have a canonical source URL/,
  );

  assert.equal(fetchCalled, false);
});

test("server retriever propagates source fetch failure", async () => {
  const {
    ServerLegalSourceRetriever,
  } = require("./retriever");

  const source = {
    id: "source-fetch-failure",
    title: "Fetch Failure Source",
    citation: "Example Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    sourceUrl: "https://legal.example.gov/case/2",
    availability: "available",
    retrievedAt: new Date(),
  };

  const retriever = new ServerLegalSourceRetriever({
    registry: {
      getById(id) {
        return id === source.id ? source : undefined;
      },
    },
    fetcher: {
      async fetch() {
        throw new Error("Source fetch failed.");
      },
    },
  });

  await assert.rejects(
    retriever.retrieve({
      candidates: [{ id: source.id }],
    }),
    /Source fetch failed/,
  );
});

test("server retriever resolves canonical sources from the default registry", async () => {
  const {
    ServerLegalSourceRetriever,
  } = require("./retriever");

  const {
    ServerLegalSourceRegistry,
  } = require("./registry");

  const registry = new ServerLegalSourceRegistry();

  const requestedIds = [
    "portal:in:supreme-court",
    "portal:in:jk-ladakh-high-court",
    "portal:in:india-code",
  ];

  const fetchedUrls = [];

  const fetcher = {
    async fetch(request) {
      fetchedUrls.push(request.url);

      return {
        status: 200,
        contentType: "text/html",
        finalUrl: request.url,
        body: `<html><body>Canonical evidence for ${request.url}</body></html>`,
      };
    },
  };

  const retriever = new ServerLegalSourceRetriever({
    registry,
    fetcher,
  });

  const result = await retriever.retrieve({
    candidates: requestedIds.map((id) => ({
      id,
      sourceUrl: "https://attacker.example/evil",
    })),
  });

  assert.deepEqual(
    result.sources.map((source) => source.id),
    requestedIds,
  );

  assert.deepEqual(fetchedUrls, [
    "https://www.sci.gov.in/",
    "https://jkhighcourt.nic.in/",
    "https://www.indiacode.nic.in/",
  ]);

  assert.equal(result.evidence.length, 3);
  assert.deepEqual(
    result.evidence.map((evidence) => evidence.sourceId),
    requestedIds,
  );
});

test("server retriever creates research sources and citations for retrieved evidence", async () => {
  const { ServerLegalSourceRetriever } = require("./retriever");

  const source = {
    id: "source-citation-contract",
    title: "Supreme Court Legal Source",
    citation: "Example Citation 2026",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://legal.example.gov/case/citation-contract",
    availability: "available",
    retrievedAt: new Date(),
  };

  const retriever = new ServerLegalSourceRetriever({
    registry: {
      getById(id) {
        return id === source.id ? source : undefined;
      },
    },
    fetcher: {
      async fetch() {
        return {
          status: 200,
          contentType: "text/html",
          finalUrl: source.sourceUrl,
          body: "<html><body>Verified judgment text.</body></html>",
        };
      },
    },
  });

  const result = await retriever.retrieve({
    candidates: [{ id: source.id }],
  });

  assert.equal(result.researchSources.length, 1);

  assert.equal(
    result.researchSources[0].id,
    source.id,
  );

  assert.equal(
    result.researchSources[0].title,
    source.title,
  );

  assert.equal(
    result.researchSources[0].citation,
    source.citation,
  );

  assert.equal(
    result.researchSources[0].sourceType,
    source.sourceType,
  );

  assert.equal(
    result.researchSources[0].jurisdictionId,
    source.jurisdiction.jurisdictionId,
  );

  assert.equal(
    result.researchSources[0].authorityId,
    source.authorityId,
  );

  assert.equal(
    result.researchSources[0].authorityName,
    source.authorityName,
  );

  assert.equal(
    result.researchSources[0].sourceUrl,
    source.sourceUrl,
  );

  assert.equal(
    result.researchSources[0].verificationStatus,
    "unverified",
  );

  assert.equal(result.citations.length, 1);

  assert.deepEqual(
    result.citations[0],
    {
      sourceId: source.id,
      evidenceId: `${source.id}:full-text`,
      citation: source.citation,
      verificationStatus: "unverified",
    },
  );
});

test("server retriever fetches an exact legal document URL bound to its trusted source", async () => {
  const { ServerLegalSourceRetriever } = require("./retriever");

  const source = {
    id: "portal:in:supreme-court",
    title: "Supreme Court of India",
    citation: "Supreme Court of India",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://www.sci.gov.in/",
    canonicalUrl: "https://www.sci.gov.in/",
    availability: "available",
    retrievedAt: new Date(),
  };

  let fetchedRequest;

  const registry = {
    getById(id) {
      return id === source.id ? source : undefined;
    },
  };

  const fetcher = {
    async fetch(request) {
      fetchedRequest = request;

      return {
        status: 200,
        contentType: "text/html",
        finalUrl: request.url,
        body: "<html><body>Exact judgment text</body></html>",
      };
    },
  };

  const retriever = new ServerLegalSourceRetriever({
    registry,
    fetcher,
  });

  const result = await retriever.retrieve({
    query: {
      query: "fundamental rights",
      sources: ["cases"],
    },
    candidates: [
      {
        id: "document:sc:2026:case-004",
        sourceId: source.id,
        title: "Synthetic Supreme Court Judgment 4",
        documentUrl:
          "https://www.sci.gov.in/example/judgment-004",
        sourceType: "cases",
        jurisdiction: source.jurisdiction,
        authorityId: source.authorityId,
        authorityName: source.authorityName,
        citation: "Synthetic Citation 2026-4",
        relevance: 0.96,
      },
    ],
  });

  assert.deepEqual(fetchedRequest, {
    url: "https://www.sci.gov.in/example/judgment-004",
  });

  assert.equal(result.sources.length, 1);
  assert.equal(result.sources[0].id, source.id);

  assert.equal(result.evidence.length, 1);
  assert.equal(
    result.evidence[0].sourceId,
    source.id,
  );
  assert.equal(
    result.evidence[0].excerpt,
    "Exact judgment text",
  );

  assert.equal(result.researchSources.length, 1);
  assert.equal(
    result.researchSources[0].sourceUrl,
    "https://www.sci.gov.in/example/judgment-004",
  );

  assert.equal(result.citations.length, 1);
  assert.equal(
    result.citations[0].evidenceId,
    `${source.id}:full-text`,
  );
});

test("server retriever rejects a document URL outside the trusted source origin", async () => {
  const { ServerLegalSourceRetriever } = require("./retriever");

  const source = {
    id: "portal:in:supreme-court",
    title: "Supreme Court of India",
    citation: "Supreme Court of India",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://www.sci.gov.in/",
    canonicalUrl: "https://www.sci.gov.in/",
    availability: "available",
    retrievedAt: new Date(),
  };

  let fetchCalled = false;

  const retriever = new ServerLegalSourceRetriever({
    registry: {
      getById(id) {
        return id === source.id ? source : undefined;
      },
    },

    fetcher: {
      async fetch() {
        fetchCalled = true;
        throw new Error("Fetcher must not be called.");
      },
    },
  });

  await assert.rejects(
    retriever.retrieve({
      query: {
        query: "fundamental rights",
        sources: ["cases"],
      },
      candidates: [
        {
          id: "document:sc:2026:attacker-001",
          sourceId: source.id,
          title: "Attacker Document",
          documentUrl: "https://attacker.example/fake-judgment",
          sourceType: "cases",
        },
      ],
    }),
    /outside the trusted source origin/,
  );

  assert.equal(fetchCalled, false);
});

test("server retriever extracts text from PDF evidence", async () => {
  const { PDFParse } = require("pdf-parse");
  const { ServerLegalSourceRetriever } = require("./retriever");

  const source = {
    id: "source-pdf-test",
    title: "Supreme Court PDF Test",
    citation: "PDF Test Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://api.sci.gov.in/jonew/judis/test.pdf",
    availability: "available",
    retrievedAt: new Date(),
  };

  const pdfText = "Supreme Court judgment evidence from PDF.";

  // Generate a small valid PDF through the parser's supported test fixture
  // is intentionally avoided here; use the known real SCI PDF downloaded
  // during integration testing instead.
  const fs = require("node:fs");
  const path = require("node:path");
  const pdfBody = fs.readFileSync(path.join(__dirname, "..", "sci-1196-test.pdf"));

  const retriever = new ServerLegalSourceRetriever({
    registry: {
      getById(id) {
        return id === source.id ? source : undefined;
      },
    },
    fetcher: {
      async fetch(request) {
        assert.equal(request.url, source.sourceUrl);

        return {
          status: 200,
          contentType: "application/pdf",
          finalUrl: source.sourceUrl,
          body: pdfBody,
        };
      },
    },
  });

  const result = await retriever.retrieve({
    candidates: [{ id: source.id }],
  });

  assert.equal(result.sources.length, 1);
  assert.equal(result.evidence.length, 1);
  assert.equal(result.evidence[0].sourceId, source.id);
  assert.equal(result.evidence[0].kind, "full-text");
  assert.match(result.evidence[0].excerpt, /STATE OF SERAIKELLA/i);
  assert.match(result.evidence[0].excerpt, /UNION OF INDIA/i);
  assert.ok(result.evidence[0].excerpt.length > 1000);
  assert.equal(result.fetches[0].contentType, "application/pdf");
  assert.equal(result.fetches[0].finalUrl, source.sourceUrl);

  // Confirm the fixture itself remains parseable by the same dependency.
  const parser = new PDFParse({ data: pdfBody });
  const parsed = await parser.getText();
  await parser.destroy();

  assert.match(parsed.text, /STATE OF SERAIKELLA/i);
});
