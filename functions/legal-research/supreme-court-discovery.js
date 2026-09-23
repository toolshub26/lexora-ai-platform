"use strict";

const {
  SupremeCourtSuplisSession,
} = require("./supreme-court-suplis-session");



const SCI_LIBRARY_ORIGIN =
  "https://registry.sci.gov.in";
const SCI_SUPLIS_SEARCH_URL =
  `${SCI_LIBRARY_ORIGIN}/library-portal/suplis/famoustest.asp`;

class ServerSupremeCourtDocumentSearcher {
  constructor(options = {}) {
    if (typeof options.fetch !== "function") {
      throw new Error("A valid Supreme Court fetch function is required.");
    }

    this.fetch = options.fetch;

    this.session =
      options.session ||
      new SupremeCourtSuplisSession({
        request: this.fetch,
      });
  }

  async search(request) {
    const query = String(request?.query || "").trim();
    const source = request?.source;

    if (!query) {
      return [];
    }

    if (
      !source ||
      source.id !== "portal:in:supreme-court"
    ) {
      throw new Error("Supreme Court source is required.");
    }

    const searchTypes = ["W", "F"];

    for (const famtype of searchTypes) {
      const response =
        await this.session.search(query, famtype);

      if (!response || typeof response !== "object") {
        throw new Error("Supreme Court search failed.");
      }

      if (
        typeof response.statusCode !== "number" ||
        response.statusCode < 200 ||
        response.statusCode >= 300
      ) {
        throw new Error(
          `Supreme Court search failed with HTTP status ${response.statusCode}.`,
        );
      }

      const results =
        parseSupremeCourtSearchResults(
          String(response.body || ""),
        );

      if (results.length > 0) {
        for (const result of results) {
          if (!result.metadata?.suplisCaseId) {
            continue;
          }

          const detailResponse =
            await this.session.getDetail(
              result.metadata.suplisCaseId,
            );

          if (
            detailResponse &&
            detailResponse.statusCode >= 200 &&
            detailResponse.statusCode < 300
          ) {
            const caseNumber =
              parseSupremeCourtCaseNumber(
                String(detailResponse.body || ""),
              );

            if (caseNumber) {
              result.metadata.caseNumber = caseNumber;
            }
          }
        }

        return results;
      }
    }

    return [];
  }
}

function parseSupremeCourtSearchResults(html) {
  const results = [];

  const rowPattern =
    /href=["']?famous2\.asp\?case1=(\d+)["']?[\s\S]*?>([^<]+)<\/a>[\s\S]*?DOJ\s*:\s*<\/font>\s*([^<]+)<\/a>[\s\S]*?CITATION\(s\)[\s\S]*?<\/b>([\s\S]*?)<\/td>/gi;

  let match;

  while ((match = rowPattern.exec(html)) !== null) {
    const caseId = match[1];
    const title = decodeHtml(match[2]);
    const dateText = decodeHtml(match[3]);
    const citationHtml = match[4];

    const citations = extractCitations(citationHtml);

    results.push({
      id: `document:supreme-court:${caseId}`,
      title,
      documentUrl:
        `${SCI_LIBRARY_ORIGIN}` +
        `/library-portal/suplis/famous2.asp?case1=${caseId}`,
      citation: citations.join(" = "),
      publishedAt: parseIndianDate(dateText),
      metadata: {
        suplisCaseId: caseId,
        citations,
      },
    });
  }

  return results;
}

function parseSupremeCourtCaseNumber(html) {
  const text = String(html || '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const match = text.match(
    /Case No\.\s*:\s*(.*?)\s+Date Of Judgement\s*:/i,
  );

  if (!match) {
    return undefined;
  }

  return decodeHtml(match[1])
    .replace(/\s+/g, ' ')
    .trim();
}

function extractCitations(html) {
  const citations = [];

  const pattern = new RegExp(
    '<b[^>]*color\\s*:\\s*brown[^>]*>([\\s\\S]*?)<\\/b>',
    "gi",
  );

  let match;

  while (
    (match = pattern.exec(String(html || ""))) !== null
  ) {
    const citation = decodeHtml(
      match[1].replace(/<[^>]+>/g, " "),
    )
      .replace(/\s+/g, " ")
      .replace(/\s*=+\s*$/g, "")
      .trim();

    if (citation) {
      citations.push(citation);
    }
  }

  return citations;
}
function parseIndianDate(value) {
  const match = String(value).match(
    /(\d{2})\/(\d{2})\/(\d{4})/,
  );

  if (!match) {
    return undefined;
  }

  const [, day, month, year] = match;

  return new Date(
    `${year}-${month}-${day}T00:00:00.000Z`,
  ).toISOString();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"')
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  ServerSupremeCourtDocumentSearcher,
  parseSupremeCourtSearchResults,
  parseSupremeCourtCaseNumber,
};
