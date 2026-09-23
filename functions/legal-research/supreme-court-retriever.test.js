"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  SupremeCourtDocumentRetriever,
} = require("./supreme-court-retriever");

test("does not fetch or resolve a SUPLIS document when authoritative SCI ID is unavailable", async () => {
  let resolverCalled = false;

  const locator = {
    async locate(document) {
      assert.equal(document.metadata.suplisCaseId, "19037");
      return null;
    },
  };

  const resolver = {
    async resolve() {
      resolverCalled = true;
      throw new Error("Resolver must not be called without an SCI judgment ID.");
    },
  };

  const retriever = new SupremeCourtDocumentRetriever({
    locator,
    resolver,
  });

  const result = await retriever.retrieve({
    query: {
      query: "Kesavananda Bharati",
    },
    candidates: [
      {
        id: "document:supreme-court:19037",
        sourceId: "portal:in:supreme-court",
        title:
          "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
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
    ],
  });

  assert.equal(resolverCalled, false);
  assert.deepEqual(result, {
    sources: [],
    evidence: [],
    researchSources: [],
    citations: [],
    fetches: [],
    unresolved: [
      {
        documentId: "document:supreme-court:19037",
        reason: "Authoritative SCI judgment ID is unavailable.",
      },
    ],
  });
});

test("passes an authoritative SCI judgment ID from the locator to the resolver", async () => {
  let resolvedDocument;

  const locator = {
    async locate(document) {
      assert.equal(document.metadata.suplisCaseId, "19037");

      return {
        sciJudgmentId: "29981",
        mappingSource: "verified-authoritative-mapping",
      };
    },
  };

  const resolver = {
    async resolve(document) {
      resolvedDocument = document;

      return {
        id: "29981",
        url: "https://api.sci.gov.in/jonew/judis/29981.pdf",
        verified: true,
        extractedText:
          "CASE NO.: Writ Petition (civil) 135 of 1970 " +
          "DATE OF JUDGMENT: 24/04/1973",
        verification: {
          verified: true,
          matchedCount: 3,
          matches: {
            caseNumber: true,
            title: true,
            date: true,
          },
        },
      };
    },
  };

  const retriever = new SupremeCourtDocumentRetriever({
    locator,
    resolver,
  });

  await retriever.retrieve({
    candidates: [
      {
        id: "document:supreme-court:19037",
        sourceId: "portal:in:supreme-court",
        title:
          "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
        publishedAt: "1973-04-24T00:00:00.000Z",
        metadata: {
          suplisCaseId: "19037",
          caseNumber: "W.P.(C) 135 OF 1970",
        },
      },
    ],
  });

  assert.equal(resolvedDocument.metadata.sciJudgmentId, "29981");
  assert.equal(resolvedDocument.metadata.suplisCaseId, "19037");
});

test("converts a verified SCI resolver result into legal retrieval evidence", async () => {
  const locator = {
    async locate() {
      return {
        sciJudgmentId: "29981",
        mappingSource: "verified-authoritative-mapping",
      };
    },
  };

  const resolver = {
    async resolve(document) {
      assert.equal(document.metadata.sciJudgmentId, "29981");

      return {
        id: "29981",
        url: "https://api.sci.gov.in/jonew/judis/29981.pdf",
        verified: true,
        extractedText:
          "CASE NO.: Writ Petition (civil) 135 of 1970 " +
          "PETITIONER: Kesavananda Bharati Sripadagalvaru and Ors " +
          "RESPONDENT: State of Kerala and Anr " +
          "DATE OF JUDGMENT: 24/04/1973",
        verification: {
          verified: true,
          matchedCount: 3,
          matches: {
            caseNumber: true,
            title: true,
            date: true,
          },
        },
      };
    },
  };

  const retriever = new SupremeCourtDocumentRetriever({
    locator,
    resolver,
  });

  const result = await retriever.retrieve({
    candidates: [
      {
        id: "document:supreme-court:19037",
        sourceId: "portal:in:supreme-court",
        title:
          "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
        citation: "1973 ( 4 ) SCC 225",
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
    ],
  });

  assert.equal(result.sources.length, 1);
  assert.equal(result.sources[0].id, "portal:in:supreme-court");

  assert.equal(result.evidence.length, 1);
  assert.equal(
    result.evidence[0].sourceId,
    "portal:in:supreme-court",
  );
  assert.match(
    result.evidence[0].excerpt,
    /Writ Petition \(civil\) 135 of 1970/i,
  );

  assert.equal(result.researchSources.length, 1);
  assert.equal(
    result.researchSources[0].sourceUrl,
    "https://api.sci.gov.in/jonew/judis/29981.pdf",
  );

  assert.equal(result.citations.length, 1);
  assert.deepEqual(result.citations[0], {
    sourceId: "portal:in:supreme-court",
    evidenceId: "portal:in:supreme-court:full-text",
    citation: "1973 ( 4 ) SCC 225",
    verificationStatus: "unverified",
  });

  assert.equal(result.fetches.length, 1);
  assert.equal(result.fetches[0].sourceId, "portal:in:supreme-court");
  assert.equal(result.fetches[0].status, 200);
  assert.equal(
    result.fetches[0].finalUrl,
    "https://api.sci.gov.in/jonew/judis/29981.pdf",
  );
});
