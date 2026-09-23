"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const { ServerLegalResearchService } = require("./service");

test("server legal research service delegates to the orchestrator", async () => {
  const request = {
    query: {
      query: "Test legal research query",
      sources: ["cases"],
      jurisdiction: {
        countryCode: "IN",
        jurisdictionId: "india",
      },
    },
  };

  const orchestrationResult = {
    research: {
      query: "Test legal research query",
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

  let receivedRequest;
  let callCount = 0;

  const orchestrator = {
    async execute(value) {
      callCount += 1;
      receivedRequest = value;
      return orchestrationResult;
    },
  };

  const service = new ServerLegalResearchService({ orchestrator });

  const result = await service.research(request);

  assert.equal(callCount, 1);
  assert.deepEqual(receivedRequest, request);
  assert.strictEqual(result, orchestrationResult);
});

test("server legal research service requires an orchestrator", () => {
  assert.throws(
    () => new ServerLegalResearchService(),
    /valid legal research orchestrator/,
  );
});

test("server legal research service propagates orchestration failure", async () => {
  const service = new ServerLegalResearchService({
    orchestrator: {
      async execute() {
        throw new Error("Orchestration failed.");
      },
    },
  });

  await assert.rejects(
    service.research({
      query: {
        query: "Test failure",
        sources: ["cases"],
      },
    }),
    /Orchestration failed/,
  );
});
