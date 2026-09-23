"use strict";

const { PDFParse } = require("pdf-parse");

const SCI_PDF_ORIGIN = "https://api.sci.gov.in";
const SCI_PDF_PATH = "/jonew/judis";

class SupremeCourtJudgmentResolver {
  constructor(options = {}) {
    if (typeof options.fetch !== "function") {
      throw new Error(
        "A valid Supreme Court PDF fetch function is required.",
      );
    }

    this.fetch = options.fetch;
    this.extractPdfText =
      typeof options.extractPdfText === "function"
        ? options.extractPdfText
        : extractPdfText;
  }

  async resolve(document) {
    validateDocument(document);

    const candidates = buildPdfCandidates(document);

    for (const candidate of candidates) {
      const response = await this.fetch(candidate.url);

      if (!response || typeof response !== "object") {
        continue;
      }

      if (
        typeof response.status !== "number" ||
        response.status < 200 ||
        response.status >= 300
      ) {
        continue;
      }

      const contentType = String(
        response.contentType || "",
      ).toLowerCase();

      if (!contentType.includes("application/pdf")) {
        continue;
      }

      if (!Buffer.isBuffer(response.body)) {
        continue;
      }

      const extractedText =
        await this.extractPdfText(response.body);

      const verification = verifyJudgmentIdentity(
        response.body,
        document,
        extractedText,
      );

      if (!verification.verified) {
        continue;
      }

      return {
        ...candidate,
        verified: true,
        verification,
        extractedText,
      };
    }

    return null;
  }
}

async function extractPdfText(pdfBody) {
  const parser = new PDFParse({
    data: pdfBody,
  });

  try {
    const result = await parser.getText();

    return String(result?.text || "")
      .replace(/\s+/g, " ")
      .trim();
  } finally {
    await parser.destroy();
  }
}

function buildPdfCandidates(document) {
  const metadata = document.metadata || {};
  const candidates = [];

  if (metadata.sciJudgmentId) {
    const id = String(metadata.sciJudgmentId);

    candidates.push({
      id,
      url:
        `${SCI_PDF_ORIGIN}${SCI_PDF_PATH}/` +
        `${encodeURIComponent(id)}.pdf`,
    });
  }

  return candidates;
}

function verifyJudgmentIdentity(
  pdfBody,
  document,
  extractedText,
) {
  if (!Buffer.isBuffer(pdfBody)) {
    return {
      verified: false,
      reason: "PDF body is not a Buffer.",
    };
  }

  const text = String(extractedText || "")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) {
    return {
      verified: false,
      reason: "PDF text extraction produced no text.",
    };
  }

  const expected = extractExpectedIdentity(document);

  const matches = {
    caseNumber:
      expected.caseNumber
        ? matchesCaseNumber(text, expected.caseNumber)
        : false,

    title:
      expected.title
        ? matchesCaseTitle(text, expected.title)
        : false,

    date:
      expected.publishedAt
        ? matchesDate(text, expected.publishedAt)
        : false,
  };

  const matchedCount = Object.values(matches)
    .filter(Boolean)
    .length;

  return {
    verified: matchedCount >= 2,
    matchedCount,
    matches,
  };
}

function extractExpectedIdentity(document) {
  const metadata = document.metadata || {};

  return {
    caseNumber:
      metadata.caseNumber ||
      document.caseNumber ||
      "",

    title:
      document.title ||
      "",

    publishedAt:
      document.publishedAt ||
      "",
  };
}

function matchesCaseNumber(text, caseNumber) {
  const normalizedText = normalizeForMatch(text);
  const normalizedCase = normalizeForMatch(caseNumber);

  if (normalizedText.includes(normalizedCase)) {
    return true;
  }

  const match = normalizedCase.match(
    /(?:W P C|WRIT PETITION CIVIL)\s+(\d+)\s+OF\s+(\d{4})/,
  );

  if (!match) {
    return false;
  }

  const number = match[1];
  const year = match[2];

  return (
    normalizedText.includes(
      `WRIT PETITION CIVIL ${number} OF ${year}`,
    ) ||
    normalizedText.includes(
      `WRIT PETITION ${number} OF ${year}`,
    )
  );
}

function matchesCaseTitle(text, title) {
  const normalizedText = normalizeForMatch(text);
  const normalizedTitle = normalizeForMatch(title);

  if (normalizedText.includes(normalizedTitle)) {
    return true;
  }

  const parts = normalizedTitle
    .split(" VS ")
    .map((part) => part.trim())
    .filter(Boolean);

  if (parts.length < 2) {
    return false;
  }

  const petitioner = parts[0]
    .replace(/\bSRIPADAGALVARU\b/g, "")
    .replace(/\bAND ORS\b/g, "")
    .trim();

  const respondent = parts[1]
    .replace(/\bAND ANR\b/g, "")
    .trim();

  return (
    petitioner.length > 5 &&
    respondent.length > 5 &&
    normalizedText.includes(petitioner) &&
    normalizedText.includes(respondent)
  );
}

function matchesDate(text, publishedAt) {
  const date = new Date(publishedAt);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = String(date.getUTCFullYear());

  return (
    text.includes(`${day}/${month}/${year}`) ||
    text.includes(`${day}.${month}.${year}`) ||
    text.includes(`${day}-${month}-${year}`) ||
    text.includes(`${day}/${month}/${year}`.replace(/^0/, ""))
  );
}

function normalizeForMatch(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function validateDocument(document) {
  if (!document || typeof document !== "object") {
    throw new Error("A Supreme Court document is required.");
  }

  if (
    !document.metadata ||
    !document.metadata.sciJudgmentId
  ) {
    throw new Error(
      "A resolved official SCI judgment ID is required.",
    );
  }

  if (!document.title) {
    throw new Error(
      "A Supreme Court document title is required.",
    );
  }

  if (!document.publishedAt) {
    throw new Error(
      "A Supreme Court document date is required.",
    );
  }
}

module.exports = {
  SupremeCourtJudgmentResolver,
  buildPdfCandidates,
  verifyJudgmentIdentity,
  normalizeForMatch,
  extractPdfText,
};
