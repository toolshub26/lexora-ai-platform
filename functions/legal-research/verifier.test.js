"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerLegalSourceVerifier,
} = require("./verifier");

test("verifier marks supplied sources as unverified by default", async () => {
  const verifier = new ServerLegalSourceVerifier();

  const result = await verifier.verify({
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
    citations: [],
  });

  assert.deepEqual(result.verifications, [
    {
      sourceId: "source-1",
      status: "unverified",
      authorityConfirmed: false,
      jurisdictionConfirmed: false,
    },
  ]);
});

test("verifier marks supplied citations as unverified", async () => {
  const verifier = new ServerLegalSourceVerifier();

  const citation = {
    sourceId: "source-1",
    citation: "Example Citation",
    verificationStatus: "verified",
  };

  const result = await verifier.verify({
    sources: [],
    evidence: [],
    citations: [citation],
  });

  assert.deepEqual(result.citations, [
    {
      ...citation,
      verificationStatus: "unverified",
    },
  ]);
});

test("verifier does not invent verification for empty input", async () => {
  const verifier = new ServerLegalSourceVerifier();

  const result = await verifier.verify({
    sources: [],
    evidence: [],
    citations: [],
  });

  assert.deepEqual(result, {
    verifications: [],
    citations: [],
  });
});

test("verifier fails closed when verification input is missing", async () => {
  const verifier = new ServerLegalSourceVerifier();

  const result = await verifier.verify();

  assert.deepEqual(result, {
    verifications: [],
    citations: [],
  });
});

test("verifier marks a source verified when all required checks pass", async () => {
  const authority = {
    id: "authority-1",
    name: "Example Court",
    type: "court",
    countryCode: "IN",
    jurisdictionId: "jurisdiction-1",
    officialUrl: "https://court.example.gov/",
    active: true,
  };

  const jurisdiction = {
    id: "jurisdiction-1",
    name: "Example Jurisdiction",
    level: "state",
    countryCode: "IN",
    active: true,
  };

  const source = {
    id: "source-1",
    title: "Example Judgment",
    citation: "Example Judgment Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "jurisdiction-1",
    },
    authorityId: "authority-1",
    authorityName: "Example Court",
    sourceUrl: "https://example.gov/judgment",
    canonicalUrl: "https://example.gov/judgment",
    availability: "available",
    retrievedAt: new Date(),
  };

  const evidence = {
    id: "evidence-1",
    sourceId: "source-1",
    kind: "full-text",
    excerpt: "Example judgment text.",
    retrievedAt: new Date(),
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById(id) {
        return id === authority.id ? authority : undefined;
      },
    },
    jurisdictionRegistry: {
      getById(id) {
        return id === jurisdiction.id ? jurisdiction : undefined;
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [evidence],
    citations: [
      {
        sourceId: "source-1",
        citation: source.citation,
        verificationStatus: "unverified",
      },
    ],
    fetches: [
      {
        sourceId: "source-1",
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
      },
    ],
  });

  assert.deepEqual(result.verifications, [
    {
      sourceId: "source-1",
      status: "verified",
      verifiedAt: result.verifications[0].verifiedAt,
      verifiedUrl: source.sourceUrl,
      verifiedTitle: source.title,
      authorityConfirmed: true,
      jurisdictionConfirmed: true,
    },
  ]);

  assert.equal(
    result.verifications[0].verifiedAt instanceof Date,
    true,
  );

  assert.deepEqual(result.citations, [
    {
      sourceId: "source-1",
      citation: source.citation,
      verificationStatus: "verified",
    },
  ]);
});

test("verifier remains unverified when authority cannot be resolved", async () => {
  const source = {
    id: "source-1",
    title: "Example Judgment",
    citation: "Example Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "jurisdiction-1",
    },
    authorityId: "missing-authority",
    sourceUrl: "https://example.gov/judgment",
    canonicalUrl: "https://example.gov/judgment",
    availability: "available",
    retrievedAt: new Date(),
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById() {
        return undefined;
      },
    },
    jurisdictionRegistry: {
      getById() {
        return {
          id: "jurisdiction-1",
          name: "Example Jurisdiction",
          level: "state",
          countryCode: "IN",
          active: true,
        };
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        kind: "full-text",
        excerpt: "Example judgment text.",
        retrievedAt: new Date(),
      },
    ],
    citations: [],
    fetches: [
      {
        sourceId: "source-1",
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
      },
    ],
  });

  assert.equal(result.verifications[0].status, "unverified");
  assert.equal(result.verifications[0].authorityConfirmed, false);
  assert.equal(result.verifications[0].jurisdictionConfirmed, true);
});

test("verifier remains unverified when jurisdiction cannot be resolved", async () => {
  const source = {
    id: "source-1",
    title: "Example Judgment",
    citation: "Example Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "missing-jurisdiction",
    },
    authorityId: "authority-1",
    sourceUrl: "https://example.gov/judgment",
    canonicalUrl: "https://example.gov/judgment",
    availability: "available",
    retrievedAt: new Date(),
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById() {
        return {
          id: "authority-1",
          name: "Example Court",
          type: "court",
          countryCode: "IN",
          jurisdictionId: "missing-jurisdiction",
          active: true,
        };
      },
    },
    jurisdictionRegistry: {
      getById() {
        return undefined;
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        kind: "full-text",
        excerpt: "Example judgment text.",
        retrievedAt: new Date(),
      },
    ],
    citations: [],
    fetches: [
      {
        sourceId: "source-1",
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
      },
    ],
  });

  assert.equal(result.verifications[0].status, "unverified");
  assert.equal(result.verifications[0].authorityConfirmed, true);
  assert.equal(result.verifications[0].jurisdictionConfirmed, false);
});

test("verifier remains unverified when fetch metadata does not match the registered source", async () => {
  const source = {
    id: "source-1",
    title: "Example Judgment",
    citation: "Example Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "jurisdiction-1",
    },
    authorityId: "authority-1",
    sourceUrl: "https://example.gov/judgment",
    canonicalUrl: "https://example.gov/judgment",
    availability: "available",
    retrievedAt: new Date(),
  };

  const authority = {
    id: "authority-1",
    name: "Example Court",
    type: "court",
    countryCode: "IN",
    jurisdictionId: "jurisdiction-1",
    officialUrl: "https://court.example.gov/",
    active: true,
  };

  const jurisdiction = {
    id: "jurisdiction-1",
    name: "Example Jurisdiction",
    level: "state",
    countryCode: "IN",
    active: true,
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById() {
        return authority;
      },
    },
    jurisdictionRegistry: {
      getById() {
        return jurisdiction;
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        kind: "full-text",
        excerpt: "Example judgment text.",
        retrievedAt: new Date(),
      },
    ],
    citations: [],
    fetches: [
      {
        sourceId: "source-1",
        status: 200,
        contentType: "text/html",
        finalUrl: "https://example.gov/different",
      },
    ],
  });

  assert.equal(result.verifications[0].status, "unverified");
});

test("verifier remains unverified when required evidence is absent", async () => {
  const source = {
    id: "source-1",
    title: "Example Judgment",
    citation: "Example Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "jurisdiction-1",
    },
    authorityId: "authority-1",
    sourceUrl: "https://example.gov/judgment",
    canonicalUrl: "https://example.gov/judgment",
    availability: "available",
    retrievedAt: new Date(),
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById() {
        return {
          id: "authority-1",
          name: "Example Court",
          type: "court",
          countryCode: "IN",
          jurisdictionId: "jurisdiction-1",
          active: true,
        };
      },
    },
    jurisdictionRegistry: {
      getById() {
        return {
          id: "jurisdiction-1",
          name: "Example Jurisdiction",
          level: "state",
          countryCode: "IN",
          active: true,
        };
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [],
    citations: [],
    fetches: [
      {
        sourceId: "source-1",
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
      },
    ],
  });

  assert.equal(result.verifications[0].status, "unverified");
});

test("verifier requires authority and jurisdiction to agree with the source", async () => {
  const source = {
    id: "source-1",
    title: "Example Judgment",
    citation: "Example Citation",
    sourceType: "cases",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "jurisdiction-1",
    },
    authorityId: "authority-1",
    sourceUrl: "https://example.gov/judgment",
    canonicalUrl: "https://example.gov/judgment",
    availability: "available",
    retrievedAt: new Date(),
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById() {
        return {
          id: "authority-1",
          name: "Example Court",
          type: "court",
          countryCode: "IN",
          jurisdictionId: "jurisdiction-2",
          active: true,
        };
      },
    },
    jurisdictionRegistry: {
      getById(id) {
        return {
          id,
          name: "Example Jurisdiction",
          level: "state",
          countryCode: "IN",
          active: true,
        };
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [
      {
        id: "evidence-1",
        sourceId: "source-1",
        kind: "full-text",
        excerpt: "Example judgment text.",
        retrievedAt: new Date(),
      },
    ],
    citations: [],
    fetches: [
      {
        sourceId: "source-1",
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
      },
    ],
  });

  assert.equal(result.verifications[0].status, "unverified");
  assert.equal(result.verifications[0].authorityConfirmed, false);
  assert.equal(result.verifications[0].jurisdictionConfirmed, true);
});

test("verifier fails closed for the canonical authority-less India Code source", async () => {
  const { ServerLegalSourceRegistry } = require("./registry");

  const registry = new ServerLegalSourceRegistry();
  const source = registry.getById("portal:in:india-code");

  assert.ok(source);
  assert.equal(source.authorityLevel, "primary");
  assert.equal(source.sourceType, "official-publications");
  assert.equal(source.authorityId, undefined);

  const verifier = new ServerLegalSourceVerifier();

  const result = await verifier.verify({
    sources: [source],
    evidence: [
      {
        id: "portal:in:india-code:full-text",
        sourceId: source.id,
        kind: "full-text",
        excerpt: "Official India Code source evidence.",
        retrievedAt: new Date(),
      },
    ],
    citations: [
      {
        sourceId: source.id,
        evidenceId: "portal:in:india-code:full-text",
        citation: source.citation,
        verificationStatus: "unverified",
      },
    ],
    fetches: [
      {
        sourceId: source.id,
        status: 200,
        contentType: "text/html",
        finalUrl: source.sourceUrl,
      },
    ],
  });

  assert.equal(result.verifications[0].status, "unverified");
  assert.equal(result.verifications[0].authorityConfirmed, false);
  assert.equal(result.verifications[0].jurisdictionConfirmed, false);
  assert.equal(result.citations[0].verificationStatus, "unverified");
});


test("verifier keeps Supreme Court PDF unverified without identity proof", async () => {
  const source = {
    id: "portal:in:supreme-court",
    title: "Supreme Court of India",
    citation: "Supreme Court of India",
    sourceType: "official-publications",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://www.sci.gov.in/",
    canonicalUrl: "https://www.sci.gov.in/",
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById() {
        return {
          id: "court:in:supreme-court",
          countryCode: "IN",
          jurisdictionId: "country:IN",
          active: true,
        };
      },
    },
    jurisdictionRegistry: {
      getById() {
        return {
          id: "country:IN",
          countryCode: "IN",
          active: true,
        };
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [{
      sourceId: source.id,
      excerpt: "Supreme Court judgment text.",
    }],
    citations: [],
    fetches: [{
      sourceId: source.id,
      status: 200,
      contentType: "application/pdf",
      finalUrl: "https://api.sci.gov.in/jonew/judis/29981.pdf",
      sciJudgmentId: "29981",
      judgmentIdentityVerified: false,
      matchedCount: 3,
    }],
  });

  assert.equal(result.verifications[0].status, "unverified");
});

test("verifier accepts an independently verified Supreme Court PDF", async () => {
  const authority = {
    id: "court:in:supreme-court",
    name: "Supreme Court of India",
    type: "court",
    countryCode: "IN",
    jurisdictionId: "country:IN",
    officialUrl: "https://www.sci.gov.in/",
    active: true,
  };

  const jurisdiction = {
    id: "country:IN",
    name: "India",
    level: "country",
    countryCode: "IN",
    active: true,
  };

  const source = {
    id: "portal:in:supreme-court",
    title: "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
    citation: "1973 ( 4 ) SCC 225",
    sourceType: "official-publications",
    authorityLevel: "primary",
    jurisdiction: {
      countryCode: "IN",
      jurisdictionId: "country:IN",
    },
    authorityId: "court:in:supreme-court",
    authorityName: "Supreme Court of India",
    sourceUrl: "https://www.sci.gov.in/",
    canonicalUrl: "https://www.sci.gov.in/",
  };

  const evidence = {
    id: "portal:in:supreme-court:full-text",
    sourceId: "portal:in:supreme-court",
    kind: "full-text",
    excerpt:
      "CASE NO.: Writ Petition (civil) 135 of 1970 DATE OF JUDGMENT: 24/04/1973",
  };

  const verifier = new ServerLegalSourceVerifier({
    authorityRegistry: {
      getById(id) {
        return id === authority.id ? authority : undefined;
      },
    },
    jurisdictionRegistry: {
      getById(id) {
        return id === jurisdiction.id ? jurisdiction : undefined;
      },
    },
  });

  const result = await verifier.verify({
    sources: [source],
    evidence: [evidence],
    citations: [
      {
        sourceId: source.id,
        citation: source.citation,
        verificationStatus: "unverified",
      },
    ],
    fetches: [
      {
        sourceId: source.id,
        status: 200,
        contentType: "application/pdf",
        finalUrl: "https://api.sci.gov.in/jonew/judis/29981.pdf",
        sciJudgmentId: "29981",
        judgmentIdentityVerified: true,
        matchedCount: 3,
      },
    ],
  });

  assert.equal(result.verifications[0].status, "verified");
  assert.equal(result.verifications[0].verifiedUrl, "https://api.sci.gov.in/jonew/judis/29981.pdf");
  assert.equal(result.citations[0].verificationStatus, "verified");
});
