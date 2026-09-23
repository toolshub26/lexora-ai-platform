"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  CompositeLegalDocumentRetriever,
} = require("./composite-retriever");

test("delegates Supreme Court candidates to the Supreme Court retriever", async () => {
  let genericCalled = false;
  let supremeCourtCalled = false;

  const genericRetriever = {
    async retrieve({ candidates }) {
      genericCalled = true;
      assert.equal(candidates.length, 1);
      assert.equal(candidates[0].sourceId, "portal:in:india-code");

      return {
        sources: [{ id: "portal:in:india-code" }],
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
        sources: [{ id: "portal:in:supreme-court" }],
        evidence: [],
        researchSources: [],
        citations: [],
        fetches: [],
      };
    },
  };

  const retriever = new CompositeLegalDocumentRetriever({
    genericRetriever,
    supremeCourtRetriever,
  });

  const result = await retriever.retrieve({
    query: { query: "Kesavananda Bharati" },
    candidates: [
      {
        id: "india-code-1",
        sourceId: "portal:in:india-code",
      },
      {
        id: "supreme-court-19037",
        sourceId: "portal:in:supreme-court",
      },
    ],
  });

  assert.equal(genericCalled, true);
  assert.equal(supremeCourtCalled, true);
  assert.deepEqual(result.sources, [
    { id: "portal:in:india-code" },
    { id: "portal:in:supreme-court" },
  ]);
});
