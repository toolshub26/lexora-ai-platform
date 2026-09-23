"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createLegalResearchService,
} = require("./composition");

test("legal research composition creates a service with the verified pipeline", async () => {
  const calls = [];

  const fakeOrchestrator = {
    async execute(request) {
      calls.push(request);

      return {
        research: {
          query: request.query.query,
          sources: [],
          totalResults: 0,
          executionTimeMs: 1,
          completedAt: new Date(),
          citations: [],
        },
        evidenceSet: {
          sources: [],
          evidence: [],
          verifications: [],
          citations: [],
        },
        retrieval: {
          sources: [],
          evidence: [],
          researchSources: [],
          citations: [],
        },
        verification: {
          verifications: [],
          citations: [],
        },
      };
    },
  };

  const service = createLegalResearchService({
    geminiApiKey: "test-key",
    orchestrator: fakeOrchestrator,
  });

  assert.equal(typeof service.research, "function");

  await service.research({
    query: {
      query: "Test legal research",
      sources: ["official-publications"],
    },
    organizationId: "test-org",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].organizationId, "test-org");
  assert.equal(calls[0].query.query, "Test legal research");
});

test("legal research composition allows injected orchestrator without requiring Gemini configuration", async () => {
  const fakeOrchestrator = {
    async execute(request) {
      return {
        research: {
          query: request.query.query,
          sources: [],
          totalResults: 0,
          executionTimeMs: 1,
          completedAt: new Date(),
          citations: [],
        },
        evidenceSet: {
          sources: [],
          evidence: [],
          verifications: [],
          citations: [],
        },
        retrieval: {
          sources: [],
          evidence: [],
          researchSources: [],
          citations: [],
        },
        verification: {
          verifications: [],
          citations: [],
        },
      };
    },
  };

  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const service = createLegalResearchService({
      orchestrator: fakeOrchestrator,
    });

    assert.equal(typeof service.research, "function");

    const result = await service.research({
      query: {
        query: "Test without Gemini",
        sources: ["official-publications"],
      },
      organizationId: "test-org",
    });

    assert.equal(result.research.query, "Test without Gemini");
  } finally {
    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  }
});

test("legal research composition wires India Code document discovery through the source fetcher", async () => {
  const fetchCalls = [];

  const sourceRegistry = {
    getByJurisdiction(jurisdiction) {
      assert.deepEqual(jurisdiction, {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      });

      return [
        {
          id: "portal:in:india-code",
          title: "India Code",
          citation: "India Code — Official Government of India Legal Repository",
          sourceType: "official-publications",
          authorityLevel: "primary",
          jurisdiction: {
            countryCode: "IN",
            jurisdictionId: "country:IN",
          },
          sourceUrl: "https://www.indiacode.nic.in/",
          canonicalUrl: "https://www.indiacode.nic.in/",
          availability: "available",
          retrievedAt: new Date("2026-09-16T00:00:00.000Z"),
        },
      ];
    },

    getByType(sourceType) {
      if (sourceType === "official-publications") {
        return this.getByJurisdiction({
          countryCode: "IN",
          jurisdictionId: "country:IN",
        });
      }

      return [];
    },

    getById(id) {
      if (id !== "portal:in:india-code") {
        return undefined;
      }

      return {
        id: "portal:in:india-code",
        title: "India Code",
        citation: "India Code — Official Government of India Legal Repository",
        sourceType: "official-publications",
        authorityLevel: "primary",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "country:IN",
        },
        sourceUrl: "https://www.indiacode.nic.in/",
        canonicalUrl: "https://www.indiacode.nic.in/",
        availability: "available",
        retrievedAt: new Date("2026-09-16T00:00:00.000Z"),
      };
    },
  };

  const sourceFetcher = {
    async fetch(request) {
      fetchCalls.push(request.url);

      if (request.url.includes("/simple-search?query=")) {
        return {
          status: 200,
          contentType: "text/html",
          finalUrl: request.url,
          body: `
            <html>
              <body>
                <table>
                  <tr>
                    <th>Enactment Date</th>
                    <th>Act Number</th>
                    <th>Short Title</th>
                    <th>View</th>
                  </tr>
                  <tr>
                    <td>9-Dec-1881</td>
                    <td><em>26</em></td>
                    <td>The Negotiable Instruments Act, 1881</td>
                    <td>
                      <a href="/indiacode/handle/123456789/13092?view_type=search">
                        View...
                      </a>
                    </td>
                  </tr>
                </table>
              </body>
            </html>
          `,
        };
      }

      if (
        request.url ===
        "https://www.indiacode.nic.in/indiacode/handle/123456789/13092?view_type=search"
      ) {
        return {
          status: 200,
          contentType: "text/html",
          finalUrl: request.url,
          body: `
            <html>
              <body>
                <h1>The Negotiable Instruments Act, 1881</h1>
                <p>Section 138 — Dishonour of cheque for insufficiency of funds.</p>
              </body>
            </html>
          `,
        };
      }

      throw new Error(`Unexpected source fetch URL: ${request.url}`);
    },
  };

  const verifier = {
    async verify(request) {
      assert.equal(request.sources.length, 1);
      assert.equal(
        request.sources[0].id,
        "portal:in:india-code",
      );

      assert.equal(request.evidence.length, 1);
      assert.equal(
        request.evidence[0].sourceId,
        "portal:in:india-code",
      );

      return {
        verifications: [
          {
            sourceId: "portal:in:india-code",
            status: "verified",
            authorityConfirmed: true,
            jurisdictionConfirmed: true,
            fetchConfirmed: true,
            evidenceConfirmed: true,
          },
        ],
        citations: [
          {
            sourceId: "portal:in:india-code",
            citation:
              "India Code — Official Government of India Legal Repository",
            verificationStatus: "verified",
          },
        ],
      };
    },
  };

  const synthesis = {
    async synthesize(input) {
      assert.equal(input.sources.length, 1);
      assert.equal(
        input.sources[0].id,
        "portal:in:india-code",
      );

      return {
        summary: "Verified India Code result.",
        citationIds: ["portal:in:india-code"],
      };
    },
  };

  const service = createLegalResearchService({
    sourceRegistry,
    sourceFetcher,
    verifier,
    synthesis,
  });

  const result = await service.research({
    query: {
      query: "Negotiable Instruments Act",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
      sources: ["official-publications"],
    },
    organizationId: "test-org",
  });

  assert.equal(result.research.totalResults, 1);
  assert.equal(
    result.research.sources[0].id,
    "portal:in:india-code",
  );
  assert.equal(
    result.research.sources[0].title,
    "The Negotiable Instruments Act, 1881",
  );
  assert.equal(
    result.synthesis.summary,
    "Verified India Code result.",
  );

  assert.equal(fetchCalls.length, 2);
  assert.match(
    fetchCalls[0],
    /^https:\/\/www\.indiacode\.nic\.in\/indiacode\/simple-search\?query=/,
  );
  assert.equal(
    fetchCalls[1],
    "https://www.indiacode.nic.in/indiacode/handle/123456789/13092?view_type=search",
  );
});

test("legal research composition wires Supreme Court document discovery", async () => {
  const calls = [];

  const supremeCourtSearcher = {
    async search(request) {
      calls.push(request);
      return [
        {
          id: "sci-suplis-19037",
          sourceId: "portal:in:supreme-court",
          title: "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
          documentUrl:
            "https://registry.sci.gov.in/library-portal/suplis/famous2.asp?case1=19037",
          sourceType: "official-publications",
          jurisdiction: {
            countryCode: "IN",
            jurisdictionId: "country:IN",
          },
          authorityId: "court:in:supreme-court",
          authorityName: "Supreme Court of India",
          publishedAt: "1973-04-24T00:00:00.000Z",
          metadata: {
            suplisCaseId: "19037",
            caseNumber: "W.P.(C) 135 OF 1970",
          },
        },
      ];
    },
  };

  const retriever = {
    async retrieve({ candidates }) {
      assert.equal(candidates.length, 1);
      assert.equal(candidates[0].sourceId, "portal:in:supreme-court");

      return {
        sources: [],
        evidence: [],
        researchSources: [],
        citations: [],
        fetches: [],
      };
    },
  };

  const verifier = {
    async verify(retrieval) {
      return {
        ...retrieval,
        verifications: [],
      };
    },
  };

  const service = createLegalResearchService({
    geminiApiKey: "test-key",
    supremeCourtSearcher,
    retriever,
    verifier,
  });

  await service.research({
    query: {
      query: "Kesavananda Bharati",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
      },
      sources: ["official-publications"],
    },
    organizationId: "test-org",
  });

  assert.equal(calls.length, 1);
  assert.equal(calls[0].query, "Kesavananda Bharati");
  assert.equal(calls[0].source.id, "portal:in:supreme-court");
});

test("legal research composition wires the composite retriever", async () => {
  let genericCalled = false;
  let supremeCourtCalled = false;

  const genericRetriever = {
    async retrieve({ candidates }) {
      genericCalled = true;
      assert.equal(candidates.length, 1);
      assert.equal(candidates[0].sourceId, "portal:in:india-code");

      return {
        sources: [],
        evidence: [],
        researchSources: [],
        citations: [],
        fetches: [],
      };
    },
  };

  const supremeCourtRetriever = {
    async retrieve({ candidates }) {
      supremeCourtCalled = true;
      assert.equal(candidates.length, 1);
      assert.equal(candidates[0].sourceId, "portal:in:supreme-court");

      return {
        sources: [],
        evidence: [],
        researchSources: [],
        citations: [],
        fetches: [],
      };
    },
  };

  const compositeRetriever = {
    async retrieve(request) {
      const candidates = request.candidates || [];

      await genericRetriever.retrieve({
        ...request,
        candidates: candidates.filter(
          (candidate) =>
            candidate.sourceId !== "portal:in:supreme-court",
        ),
      });

      await supremeCourtRetriever.retrieve({
        ...request,
        candidates: candidates.filter(
          (candidate) =>
            candidate.sourceId === "portal:in:supreme-court",
        ),
      });

      return {
        sources: [],
        evidence: [],
        researchSources: [],
        citations: [],
        fetches: [],
      };
    },
  };

  assert.equal(typeof compositeRetriever.retrieve, "function");
  assert.equal(genericCalled, false);
  assert.equal(supremeCourtCalled, false);
});
