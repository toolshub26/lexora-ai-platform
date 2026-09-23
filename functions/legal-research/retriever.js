"use strict";

const { PDFParse } = require("pdf-parse");

class ServerLegalSourceRetriever {
  constructor(options = {}) {
    if (!options.registry || typeof options.registry.getById !== "function") {
      throw new Error("A valid source registry is required.");
    }

    if (!options.fetcher || typeof options.fetcher.fetch !== "function") {
      throw new Error("A valid source fetcher is required.");
    }

    this.registry = options.registry;
    this.fetcher = options.fetcher;
  }

  async retrieve(request) {
    const candidates = Array.isArray(request?.candidates)
      ? request.candidates
      : [];

    const sources = [];
    const evidence = [];
    const researchSources = [];
    const citations = [];
    const fetches = [];

    for (const candidate of candidates) {
      if (!candidate || typeof candidate.id !== "string") {
        throw new Error("A valid legal source or document candidate is required.");
      }

      const isDocumentCandidate =
        typeof candidate.sourceId === "string" &&
        typeof candidate.documentUrl === "string";

      const sourceId = isDocumentCandidate
        ? candidate.sourceId
        : candidate.id;

      const source = this.registry.getById(sourceId);

      if (!source) {
        throw new Error(
          `Legal source candidate "${sourceId}" was not found in the source registry.`,
        );
      }

      if (!source.sourceUrl) {
        throw new Error(
          `Legal source "${source.id}" does not have a canonical source URL.`,
        );
      }

      const fetchUrl = isDocumentCandidate
        ? candidate.documentUrl
        : source.sourceUrl;

      validateDocumentUrl(fetchUrl, source);

      const fetched = await this.fetcher.fetch({
        url: fetchUrl,
      });

      fetches.push({
        sourceId: source.id,
        status: fetched.status,
        contentType: fetched.contentType,
        finalUrl: fetched.finalUrl,
      });

      const excerpt = await extractText(fetched.body, fetched.contentType);

      if (!excerpt) {
        throw new Error(
          `Legal source "${source.id}" returned empty content.`,
        );
      }

      const retrievedAt = new Date();

      sources.push(source);

      const evidenceId = `${source.id}:full-text`;

      evidence.push({
        id: evidenceId,
        sourceId: source.id,
        kind: "full-text",
        excerpt,
        retrievedAt,
      });

        researchSources.push({
          id: source.id,
          title: isDocumentCandidate ? candidate.title : source.title,
          citation: isDocumentCandidate
            ? candidate.citation || source.citation
            : source.citation,
          sourceType: isDocumentCandidate
            ? candidate.sourceType || source.sourceType
            : source.sourceType,
          jurisdictionId:
            candidate.jurisdiction?.jurisdictionId ||
            source.jurisdiction?.jurisdictionId,
          authorityId: candidate.authorityId || source.authorityId,
          authorityName: candidate.authorityName || source.authorityName,
          sourceUrl: fetchUrl,
          verificationStatus: "unverified",
          retrievedAt,
        });

      citations.push({
        sourceId: source.id,
        evidenceId,
        citation: source.citation,
        verificationStatus: "unverified",
      });
    }

    return {
      sources,
      evidence,
      researchSources,
      citations,
      fetches,
    };
  }
}

function validateDocumentUrl(documentUrl, source) {
  let documentUrlObject;

  try {
    documentUrlObject = new URL(documentUrl);
  } catch {
    throw new Error("Legal document URL must be a valid URL.");
  }

  if (documentUrlObject.protocol !== "https:") {
    throw new Error("Legal document URL must use HTTPS.");
  }

  const trustedUrls = [
    source.sourceUrl,
    source.canonicalUrl,
  ].filter(Boolean);

  const trustedOrigins = new Set();

  for (const trustedUrl of trustedUrls) {
    try {
      const trustedUrlObject = new URL(trustedUrl);

      if (trustedUrlObject.protocol === "https:") {
        trustedOrigins.add(trustedUrlObject.origin);
      }
    } catch {
      continue;
    }
  }

  if (!trustedOrigins.has(documentUrlObject.origin)) {
    throw new Error(
      `Legal document URL for source "${source.id}" is outside the trusted source origin.`,
    );
  }
}

async function extractText(body, contentType) {
  if (contentType === "application/pdf") {
    if (!Buffer.isBuffer(body)) {
      throw new Error("PDF source content must be a Buffer.");
    }

    const parser = new PDFParse({ data: body });

    try {
      const result = await parser.getText();
      return String(result?.text ?? "")
        .replace(/\s+/g, " ")
        .trim();
    } finally {
      await parser.destroy();
    }
  }

  const html = String(body ?? "");

  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  ServerLegalSourceRetriever,
};
