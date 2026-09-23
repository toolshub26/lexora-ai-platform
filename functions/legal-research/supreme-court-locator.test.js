"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  SupremeCourtJudgmentLocator,
} = require("./supreme-court-locator");

test("locator returns no mapping when authoritative SCI ID is unavailable", async () => {
  const locator = new SupremeCourtJudgmentLocator();

  const result = await locator.locate({
    id: "document:supreme-court:19037",
    title:
      "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
    publishedAt: "1973-04-24T00:00:00.000Z",
    metadata: {
      suplisCaseId: "19037",
      citations: ["1973 AIR 1461"],
      caseNumber: "W.P.(C) 135 OF 1970",
    },
  });

  assert.equal(result, null);
});

test("locator returns an explicitly provided authoritative SCI judgment ID", async () => {
  const locator = new SupremeCourtJudgmentLocator({
    mappingProvider: async ({ suplisCaseId }) => {
      assert.equal(suplisCaseId, "19037");
      return {
        sciJudgmentId: "29981",
        mappingSource: "verified-authoritative-mapping",
      };
    },
  });

  const result = await locator.locate({
    id: "document:supreme-court:19037",
    title:
      "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
    publishedAt: "1973-04-24T00:00:00.000Z",
    metadata: {
      suplisCaseId: "19037",
      citations: ["1973 AIR 1461"],
      caseNumber: "W.P.(C) 135 OF 1970",
    },
  });

  assert.deepEqual(result, {
    sciJudgmentId: "29981",
    mappingSource: "verified-authoritative-mapping",
  });
});

test("locator propagates mapping provider failures", async () => {
  const locator = new SupremeCourtJudgmentLocator({
    mappingProvider: async () => {
      throw new Error("SCI mapping provider unavailable.");
    },
  });

  await assert.rejects(
    () =>
      locator.locate({
        id: "document:supreme-court:19037",
        title:
          "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
        publishedAt: "1973-04-24T00:00:00.000Z",
        metadata: {
          suplisCaseId: "19037",
        },
      }),
    {
      message: "SCI mapping provider unavailable.",
    },
  );
});

const {
  SupremeCourtJudgmentResolver,
} = require("./supreme-court-resolver");

test("locator output can feed the SCI judgment resolver", async () => {
  const locator = new SupremeCourtJudgmentLocator({
    mappingProvider: async ({ suplisCaseId }) => {
      assert.equal(suplisCaseId, "19037");

      return {
        sciJudgmentId: "29981",
        mappingSource: "verified-authoritative-mapping",
      };
    },
  });

  const document = {
    id: "document:supreme-court:19037",
    title:
      "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
    publishedAt: "1973-04-24T00:00:00.000Z",
    metadata: {
      suplisCaseId: "19037",
      caseNumber: "W.P.(C) 135 OF 1970",
    },
  };

  const mapping = await locator.locate(document);

  assert.deepEqual(mapping, {
    sciJudgmentId: "29981",
    mappingSource: "verified-authoritative-mapping",
  });

  const resolvedDocument = {
    ...document,
    metadata: {
      ...document.metadata,
      sciJudgmentId: mapping.sciJudgmentId,
    },
  };

  const resolver = new SupremeCourtJudgmentResolver({
    fetch: async (url) => {
      assert.equal(
        url,
        "https://api.sci.gov.in/jonew/judis/29981.pdf",
      );

      return {
        status: 200,
        contentType: "application/pdf",
        body: Buffer.from("%PDF-1.2"),
      };
    },
    extractPdfText: async () =>
      "CASE NO.: Writ Petition (civil) 135 of 1970 " +
      "PETITIONER: Kesavananda Bharati Sripadagalvaru and Ors " +
      "RESPONDENT: State of Kerala and Anr " +
      "DATE OF JUDGMENT: 24/04/1973",
  });

  const resolved = await resolver.resolve(resolvedDocument);

  assert.equal(resolved.verified, true);
  assert.equal(resolved.verification.matchedCount, 3);
});
