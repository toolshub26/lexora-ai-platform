"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  createLegalResearchHandler,
  createLegalResearchCallableHandler,
} = require("../legal-research");

test("legal research handler delegates to an injected research service", async () => {
  let receivedRequest;

  const researchService = {
    async research(request) {
      receivedRequest = request;

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

  const handler = createLegalResearchHandler({
    researchService,
    requireAuth: () => "test-user",
    getAuthorizedOrganizationId: async () => "test-org",
    checkRateLimit: async () => {},
  });

  const result = await handler(
    {
      query: "Test legal research",
      organizationId: "test-org",
      sources: ["cases"],
    },
    {},
  );

  assert.equal(receivedRequest.query.query, "Test legal research");
  assert.equal(receivedRequest.query.sources[0], "cases");
  assert.equal(result.research.query, "Test legal research");
});

test("legal research handler preserves research scope for the injected service", async () => {
  let receivedRequest;

  const researchService = {
    async research(request) {
      receivedRequest = request;

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

  const handler = createLegalResearchHandler({
    researchService,
    requireAuth: () => "test-user",
    getAuthorizedOrganizationId: async () => "test-org",
    checkRateLimit: async () => {},
  });

  await handler(
    {
      query: "Supreme Court legal research",
      organizationId: "test-org",
      sources: ["official-publications"],
      practiceArea: "constitutional-law",
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "country:IN",
        authorityId: "court:in:supreme-court",
      },
      dateRange: {
        from: "2020-01-01",
        to: "2026-09-16",
      },
    },
    {},
  );

  assert.deepEqual(receivedRequest.query, {
    query: "Supreme Court legal research",
    sources: ["official-publications"],
    practiceArea: "constitutional-law",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
      authorityId: "court:in:supreme-court",
    },
    dateRange: {
      from: "2020-01-01",
      to: "2026-09-16",
    },
  });

  assert.equal(receivedRequest.organizationId, "test-org");
});

test("legal research handler returns the service result unchanged", async () => {
  const expectedResult = {
    research: {
      query: "Verified legal research",
      sources: [],
      totalResults: 0,
      executionTimeMs: 5,
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

  const researchService = {
    async research() {
      return expectedResult;
    },
  };

  const handler = createLegalResearchHandler({
    researchService,
    requireAuth: () => "test-user",
    getAuthorizedOrganizationId: async () => "test-org",
    checkRateLimit: async () => {},
  });

  const result = await handler(
    {
      query: "Verified legal research",
      organizationId: "test-org",
      sources: ["official-publications"],
    },
    {},
  );

  assert.strictEqual(result, expectedResult);
});

test("legal research handler preserves the verified pipeline result for the callable boundary", async () => {
  const expectedResult = {
    research: {
      query: "Supreme Court research",
      sources: [
        {
          id: "portal:in:supreme-court",
          verificationStatus: "verified",
        },
      ],
      totalResults: 1,
      executionTimeMs: 25,
      completedAt: new Date(),
      summary: "Verified legal research result.",
      citations: [
        {
          sourceId: "portal:in:supreme-court",
          citation: "Supreme Court of India",
          verificationStatus: "verified",
        },
      ],
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
    synthesis: {
      summary: "Verified legal research result.",
      citationIds: ["portal:in:supreme-court"],
    },
  };

  const researchService = {
    async research() {
      return expectedResult;
    },
  };

  const handler = createLegalResearchHandler({
    researchService,
    requireAuth: () => "test-user",
    getAuthorizedOrganizationId: async () => "test-org",
    checkRateLimit: async () => {},
  });

  const result = await handler(
    {
      query: "Supreme Court research",
      organizationId: "test-org",
      sources: ["official-publications"],
    },
    {},
  );

  assert.strictEqual(result, expectedResult);
  assert.equal(result.research.sources[0].verificationStatus, "verified");
  assert.equal(result.synthesis.citationIds[0], "portal:in:supreme-court");
});

test("callable handler transitions session from queued to completed", async () => {
  const updates = [];
  const writes = [];

  const sessionRef = {
    id: "session-completed-1",
    async set(value) {
      writes.push({ type: "set", value });
    },
    async update(value) {
      updates.push(value);
    },
  };

  const database = {
    collection(name) {
      if (name === "organizations") {
        return {
          doc() {
            return {
              collection() {
                return {
                  doc() {
                    return sessionRef;
                  },
                };
              },
            };
          },
        };
      }

      if (name === "ai_logs") {
        return {
          async add(value) {
            writes.push({ type: "ai_log", value });
          },
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    },
  };

  const researchService = {
    async research(request) {
      assert.equal(request.organizationId, "org-1");
      assert.equal(request.query.query, "What is Article 21?");
      return {
        research: {
          query: "What is Article 21?",
          summary: "Verified legal research result.",
          sources: [],
          totalResults: 0,
          executionTimeMs: 10,
          completedAt: new Date(),
          citations: [],
        },
        evidenceSet: {
          sources: [],
          evidence: [],
          verifications: [],
          citations: [],
        },
        retrieval: {},
        verification: {},
        synthesis: {
          summary: "Verified legal research result.",
          citationIds: [],
        },
      };
    },
  };

  const handler = createLegalResearchCallableHandler({
    db: database,
    researchService,
    requireAuth: () => "user-1",
    getAuthorizedOrganizationId: async () => "org-1",
    checkRateLimit: async () => {},
  });

  const result = await handler(
    {
      query: "What is Article 21?",
      organizationId: "org-1",
      sources: ["official-publications"],
    },
    {},
  );

  assert.equal(result.success, true);
  assert.equal(result.sessionId, "session-completed-1");
  assert.equal(result.organizationId, "org-1");
  assert.equal(result.response, "Verified legal research result.");

  assert.equal(writes[0].type, "set");
  assert.equal(writes[0].value.status, "queued");

  assert.equal(updates.length, 1);
  assert.equal(updates[0].status, "completed");

  assert.equal(writes[1].type, "ai_log");
  assert.equal(writes[1].value.status, "completed");
});

test("callable handler transitions session from queued to failed when service fails", async () => {
  const updates = [];
  const writes = [];

  const sessionRef = {
    id: "session-failed-1",
    async set(value) {
      writes.push({ type: "set", value });
    },
    async update(value) {
      updates.push(value);
    },
  };

  const database = {
    collection(name) {
      if (name === "organizations") {
        return {
          doc() {
            return {
              collection() {
                return {
                  doc() {
                    return sessionRef;
                  },
                };
              },
            };
          },
        };
      }

      if (name === "ai_logs") {
        return {
          async add(value) {
            writes.push({ type: "ai_log", value });
          },
        };
      }

      throw new Error(`Unexpected collection: ${name}`);
    },
  };

  const researchService = {
    async research() {
      throw new Error("Synthetic research failure.");
    },
  };

  const handler = createLegalResearchCallableHandler({
    db: database,
    researchService,
    requireAuth: () => "user-1",
    getAuthorizedOrganizationId: async () => "org-1",
    checkRateLimit: async () => {},
  });

  await assert.rejects(
    () =>
      handler(
        {
          query: "What is Article 21?",
          organizationId: "org-1",
          sources: ["official-publications"],
        },
        {},
      ),
    (error) => {
      assert.equal(error.code, "internal");
      assert.equal(error.message, "Legal research request failed.");
      return true;
    },
  );

  assert.equal(writes[0].type, "set");
  assert.equal(writes[0].value.status, "queued");

  assert.equal(updates.length, 1);
  assert.equal(updates[0].status, "failed");

  assert.equal(
    writes.some((entry) => entry.type === "ai_log"),
    false,
  );
});
