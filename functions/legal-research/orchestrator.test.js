"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalResearchOrchestrator,
} = require("./orchestrator");

test("requires a retriever", () => {
  assert.throws(
    () =>
      new ServerLegalResearchOrchestrator({
        verifier: { verify: async () => ({ verifications: [], citations: [] }) },
      }),
    /valid legal source retriever/,
  );
});

test("requires a verifier", () => {
  assert.throws(
    () =>
      new ServerLegalResearchOrchestrator({
        retriever: { retrieve: async () => ({}) },
      }),
    /valid legal source verifier/,
  );
});

test("executes retrieval and verification without discovery", async () => {
  const calls = [];

  const retriever = {
    async retrieve(request) {
      calls.push("retrieve");

      assert.equal(request.query.query, "Limitation period");
      assert.equal(request.candidates, undefined);

      return {
        sources: [],
        evidence: [],
        researchSources: [],
        citations: [],
        fetches: [
          {
            sourceId: "source-1",
            status: 200,
            contentType: "text/html",
            finalUrl: "https://example.gov/source-1",
          },
        ],
      };
    },
  };

  const verifier = {
    async verify(request) {
      calls.push("verify");

      assert.deepEqual(request.sources, []);
      assert.deepEqual(request.evidence, []);
      assert.deepEqual(request.citations, []);
      assert.deepEqual(request.fetches, [
        {
          sourceId: "source-1",
          status: 200,
          contentType: "text/html",
          finalUrl: "https://example.gov/source-1",
        },
      ]);

      return {
        verifications: [],
        citations: [],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    retriever,
    verifier,
  });

  const result = await orchestrator.execute({
    query: {
      query: "Limitation period",
      sources: ["cases"],
    },
  });

  assert.deepEqual(calls, ["retrieve", "verify"]);
  assert.equal(result.research.query, "Limitation period");
  assert.equal(result.research.totalResults, 0);
  assert.deepEqual(result.evidenceSet.sources, []);
  assert.deepEqual(result.evidenceSet.evidence, []);
  assert.deepEqual(result.evidenceSet.verifications, []);
  assert.deepEqual(result.evidenceSet.citations, []);
});

test("deduplicates discovery candidates before retrieval", async () => {
  let receivedCandidates;

  const discovery = {
    async discover() {
      return {
        candidates: [
          { id: "source-1" },
          { id: "source-1" },
          { id: "source-2" },
        ],
      };
    },
  };

  const retriever = {
    async retrieve(request) {
      receivedCandidates = request.candidates;

      return {
        sources: [],
        evidence: [],
        researchSources: [],
        citations: [],
      };
    },
  };

  const verifier = {
    async verify() {
      return {
        verifications: [],
        citations: [],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    discovery,
    retriever,
    verifier,
  });

  await orchestrator.execute({
    query: {
      query: "Discovery deduplication",
      sources: ["cases"],
    },
  });

  assert.deepEqual(
    receivedCandidates.map((item) => item.id),
    ["source-1", "source-2"],
  );
});

test("propagates verification status into research sources", async () => {
  const retriever = {
    async retrieve() {
      const source = {
        id: "source-1",
        title: "Example Case",
        citation: "Example Citation",
        sourceType: "cases",
        authorityLevel: "primary",
        availability: "available",
        retrievedAt: new Date(),
      };

      return {
        sources: [source],
        evidence: [],
        researchSources: [
          {
            id: source.id,
            title: source.title,
            citation: source.citation,
            sourceType: source.sourceType,
            snippet: "Example",
            relevance: 1,
            verificationStatus: "unverified",
            retrievedAt: source.retrievedAt,
          },
        ],
        citations: [],
      };
    },
  };

  const verifier = {
    async verify() {
      return {
        verifications: [
          {
            sourceId: "source-1",
            status: "verified",
            authorityConfirmed: true,
            jurisdictionConfirmed: true,
          },
        ],
        citations: [],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    retriever,
    verifier,
  });

  const result = await orchestrator.execute({
    query: {
      query: "Verification propagation",
      sources: ["cases"],
    },
  });

  assert.equal(result.research.sources.length, 1);
  assert.equal(
    result.research.sources[0].verificationStatus,
    "verified",
  );
  assert.equal(result.research.totalResults, 1);
});

test("rejects synthesis citations that are not verified", async () => {
  const retriever = {
    async retrieve() {
      return {
        sources: [
          {
            id: "source-1",
            title: "Example Case",
            citation: "Example Citation",
            sourceType: "cases",
            authorityLevel: "primary",
            availability: "available",
            retrievedAt: new Date(),
          },
        ],
        evidence: [],
        researchSources: [],
        citations: [],
      };
    },
  };

  const verifier = {
    async verify() {
      return {
        verifications: [
          {
            sourceId: "source-1",
            status: "unverified",
            authorityConfirmed: false,
            jurisdictionConfirmed: false,
          },
        ],
        citations: [
          {
            sourceId: "source-1",
            citation: "Example Citation",
            verificationStatus: "unverified",
          },
        ],
      };
    },
  };

  const synthesis = {
    async synthesize() {
      return {
        summary: "Synthetic legal summary",
        citationIds: ["source-1"],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    retriever,
    verifier,
    synthesis,
  });

  await assert.rejects(
    () =>
      orchestrator.execute({
        query: {
          query: "Test unverified citation",
          sources: ["cases"],
        },
      }),
    /invalid citation IDs: source-1/,
  );
});

test("allows synthesis citations that are verified", async () => {
  const retriever = {
    async retrieve() {
      return {
        sources: [
          {
            id: "source-1",
            title: "Verified Case",
            citation: "Verified Citation",
            sourceType: "cases",
            authorityLevel: "primary",
            availability: "available",
            retrievedAt: new Date(),
          },
        ],
        evidence: [],
        researchSources: [],
        citations: [],
      };
    },
  };

  const verifier = {
    async verify() {
      return {
        verifications: [
          {
            sourceId: "source-1",
            status: "verified",
            authorityConfirmed: true,
            jurisdictionConfirmed: true,
          },
        ],
        citations: [
          {
            sourceId: "source-1",
            citation: "Verified Citation",
            verificationStatus: "verified",
          },
        ],
      };
    },
  };

  const synthesis = {
    async synthesize() {
      return {
        summary: "Verified legal synthesis",
        citationIds: ["source-1"],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    retriever,
    verifier,
    synthesis,
  });

  const result = await orchestrator.execute({
    query: {
      query: "Test verified citation",
      sources: ["cases"],
    },
  });

  assert.equal(result.synthesis.summary, "Verified legal synthesis");
  assert.deepEqual(result.synthesis.citationIds, ["source-1"]);
});

test("passes only verified evidence to synthesis", async () => {
  const verifiedSource = {
    id: "verified-source",
    title: "Verified Case",
    citation: "Verified Case Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    availability: "available",
    retrievedAt: new Date(),
  };

  const unverifiedSource = {
    id: "unverified-source",
    title: "Unverified Case",
    citation: "Unverified Case Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    availability: "available",
    retrievedAt: new Date(),
  };

  const retriever = {
    async retrieve() {
      return {
        sources: [
          verifiedSource,
          unverifiedSource,
        ],
        evidence: [
          {
            id: "verified-evidence",
            sourceId: "verified-source",
            kind: "full-text",
            excerpt: "Verified evidence.",
            retrievedAt: new Date(),
          },
          {
            id: "unverified-evidence",
            sourceId: "unverified-source",
            kind: "full-text",
            excerpt: "Unverified evidence.",
            retrievedAt: new Date(),
          },
        ],
        researchSources: [],
        citations: [],
        fetches: [],
      };
    },
  };

  const verifier = {
    async verify() {
      return {
        verifications: [
          {
            sourceId: "verified-source",
            status: "verified",
            authorityConfirmed: true,
            jurisdictionConfirmed: true,
          },
          {
            sourceId: "unverified-source",
            status: "unverified",
            authorityConfirmed: false,
            jurisdictionConfirmed: false,
          },
        ],
        citations: [],
      };
    },
  };

  const synthesis = {
    async synthesize(input) {
      assert.deepEqual(
        input.sources.map((source) => source.id),
        ["verified-source"],
      );

      assert.deepEqual(
        input.evidence.map((item) => item.sourceId),
        ["verified-source"],
      );

      assert.deepEqual(
        input.verifications.map((item) => item.sourceId),
        ["verified-source"],
      );

      return {
        summary: "Verified legal synthesis.",
        citationIds: [],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    retriever,
    verifier,
    synthesis,
  });

  const result = await orchestrator.execute({
    query: {
      query: "Verified legal research",
      sources: ["cases"],
    },
  });

  assert.equal(
    result.synthesis.summary,
    "Verified legal synthesis.",
  );
});

test("runs document discovery after source discovery and passes documents to retrieval", async () => {
  const calls = [];

  const sourceCandidate = {
    id: "portal:in:supreme-court",
    title: "Supreme Court of India",
    sourceType: "cases",
    sourceUrl: "https://www.sci.gov.in/",
  };

  const documentCandidate = {
    id: "document:sc:2026:case-005",
    sourceId: "portal:in:supreme-court",
    title: "Synthetic Supreme Court Judgment 5",
    documentUrl: "https://www.sci.gov.in/example/judgment-005",
    sourceType: "cases",
  };

  const sourceDiscovery = {
    async discover(request) {
      calls.push("source-discovery");

      assert.equal(request.query.query, "fundamental rights");

      return {
        candidates: [sourceCandidate],
      };
    },
  };

  const documentDiscovery = {
    async discover(request) {
      calls.push("document-discovery");

      assert.deepEqual(request.query, {
        query: "fundamental rights",
        sources: ["cases"],
      });

      assert.deepEqual(request.sources, [sourceCandidate]);

      return {
        documents: [documentCandidate],
      };
    },
  };

  const retriever = {
    async retrieve(request) {
      calls.push("retrieve");

      assert.deepEqual(request.candidates, [documentCandidate]);

      return {
        sources: [
          {
            id: "portal:in:supreme-court",
            title: "Supreme Court of India",
            citation: "Synthetic Citation",
            sourceType: "cases",
            authorityLevel: "primary",
            sourceUrl: "https://www.sci.gov.in/",
            availability: "available",
            retrievedAt: new Date(),
          },
        ],
        evidence: [],
        researchSources: [],
        citations: [],
        fetches: [],
      };
    },
  };

  const verifier = {
    async verify() {
      calls.push("verify");

      return {
        verifications: [],
        citations: [],
      };
    },
  };

  const orchestrator = new ServerLegalResearchOrchestrator({
    discovery: sourceDiscovery,
    documentDiscovery,
    retriever,
    verifier,
  });

  await orchestrator.execute({
    query: {
      query: "fundamental rights",
      sources: ["cases"],
    },
  });

  assert.deepEqual(calls, [
    "source-discovery",
    "document-discovery",
    "retrieve",
    "verify",
  ]);
});
