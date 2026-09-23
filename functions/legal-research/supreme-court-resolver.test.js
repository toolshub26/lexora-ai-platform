"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  SupremeCourtJudgmentResolver,
  buildPdfCandidates,
  verifyJudgmentIdentity,
} = require("./supreme-court-resolver");

const KESAVANANDA_TEXT =
  "CASE NO.: Writ Petition (civil) 135 of 1970 " +
  "PETITIONER: Kesavananda Bharati Sripadagalvaru and Ors " +
  "RESPONDENT: State of Kerala and Anr " +
  "DATE OF JUDGMENT: 24/04/1973";

test("builds official SCI PDF candidate", () => {
  const candidates = buildPdfCandidates({
    metadata: {
      sciJudgmentId: "29981",
    },
  });

  assert.deepEqual(candidates, [
    {
      id: "29981",
      url: "https://api.sci.gov.in/jonew/judis/29981.pdf",
    },
  ]);
});

test("verifies matching SCI judgment identity", () => {
  const verification = verifyJudgmentIdentity(
    Buffer.from("%PDF-1.2"),
    {
      title:
        "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
      publishedAt: "1973-04-24T00:00:00.000Z",
      metadata: {
        caseNumber: "W.P.(C) 135 OF 1970",
      },
    },
    KESAVANANDA_TEXT,
  );

  assert.equal(verification.verified, true);
  assert.equal(verification.matchedCount, 3);
});

test("rejects unrelated judgment identity", () => {
  const verification = verifyJudgmentIdentity(
    Buffer.from("%PDF-1.2"),
    {
      title:
        "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
      publishedAt: "1973-04-24T00:00:00.000Z",
      metadata: {
        caseNumber: "W.P.(C) 135 OF 1970",
      },
    },
    "CASE NO.: Appeal (civil) 5660 of 2007 " +
      "PETITIONER: U.P. State Road Transport Corporation " +
      "RESPONDENT: Vinod Kumar " +
      "DATE OF JUDGMENT: 06/12/2007",
  );

  assert.equal(verification.verified, false);
});

test("resolver returns verified official PDF", async () => {
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

    extractPdfText: async (pdf) => {
      assert.equal(Buffer.isBuffer(pdf), true);
      return KESAVANANDA_TEXT;
    },
  });

  const result = await resolver.resolve({
    title:
      "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
    publishedAt: "1973-04-24T00:00:00.000Z",
    metadata: {
      sciJudgmentId: "29981",
      caseNumber: "W.P.(C) 135 OF 1970",
    },
  });

  assert.equal(result.verified, true);
  assert.equal(
    result.url,
    "https://api.sci.gov.in/jonew/judis/29981.pdf",
  );
  assert.equal(result.verification.matchedCount, 3);
});

test("requires an independently resolved SCI judgment ID", async () => {
  const resolver = new SupremeCourtJudgmentResolver({
    fetch: async () => {
      throw new Error("Fetch must not be called.");
    },
  });

  await assert.rejects(
    () =>
      resolver.resolve({
        id: "document:supreme-court:19037",
        title:
          "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
        publishedAt: "1973-04-24T00:00:00.000Z",
        metadata: {
          suplisCaseId: "19037",
          citations: ["1973 AIR 1461"],
          caseNumber: "W.P.(C) 135 OF 1970",
        },
      }),
    {
      message:
        "A resolved official SCI judgment ID is required.",
    },
  );
});
