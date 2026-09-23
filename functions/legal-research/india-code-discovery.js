"use strict";

const INDIA_CODE_SOURCE_ID = "portal:in:india-code";
const INDIA_CODE_ORIGIN = "https://www.indiacode.nic.in";
const INDIA_CODE_SEARCH_PATH = "/indiacode/simple-search";

class ServerIndiaCodeDocumentSearcher {
  constructor(options = {}) {
    if (typeof options.fetch !== "function") {
      throw new Error("A valid India Code fetch function is required.");
    }

    this.fetch = options.fetch;
  }

  async search(request) {
    const query = String(request?.query || "").trim();
    const source = request?.source;

    if (!source || source.id !== INDIA_CODE_SOURCE_ID) {
      throw new Error("India Code source is required.");
    }

    if (
      source.sourceUrl &&
      new URL(source.sourceUrl).origin !== INDIA_CODE_ORIGIN
    ) {
      throw new Error("India Code source is required.");
    }

    if (!query) {
      return [];
    }

    const searchUrl = buildIndiaCodeSearchUrl(query);

    const response = await this.fetch(searchUrl);

    if (!response || typeof response !== "object") {
      throw new Error("India Code search failed.");
    }

    if (
      typeof response.status !== "number" ||
      response.status < 200 ||
      response.status >= 300
    ) {
      throw new Error(
        `India Code search failed with HTTP status ${response.status}.`,
      );
    }

    const contentType = String(response.contentType || "").toLowerCase();

    if (
      contentType &&
      !contentType.includes("text/html") &&
      !contentType.includes("application/xhtml+xml")
    ) {
      throw new Error(
        `Unsupported India Code search content type: ${response.contentType}.`,
      );
    }

    return parseIndiaCodeSearchResults(String(response.body || ""));
  }
}

function buildIndiaCodeSearchUrl(query) {
  const params = new URLSearchParams();
  params.set("query", query);

  return `${INDIA_CODE_ORIGIN}${INDIA_CODE_SEARCH_PATH}?${params.toString()}`;
}

function parseIndiaCodeSearchResults(html) {
  const results = [];
  const rowPattern = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi;

  let rowMatch;

  while ((rowMatch = rowPattern.exec(html)) !== null) {
    const cells = extractCells(rowMatch[1]);

    if (cells.length < 4) {
      continue;
    }

    const enactmentDate = cleanHtmlText(cells[0]);
    const actNumber = cleanHtmlText(cells[1]);
    const title = cleanHtmlText(cells[2]);
    const viewCell = cells[3];

    const href = extractViewHref(viewCell);

    if (!href) {
      continue;
    }

    const documentUrl = buildDocumentUrl(href);

    if (!documentUrl) {
      continue;
    }

    const handleMatch = documentUrl.match(
      /\/indiacode\/handle\/123456789\/(\d+)(?:[/?#]|$)/,
    );

    if (!handleMatch) {
      continue;
    }

    const handleId = handleMatch[1];

    results.push({
      id: `document:india-code:${handleId}`,
      title,
      documentUrl,
      citation: buildCitation(actNumber, enactmentDate),
      publishedAt: normalizePublishedDate(enactmentDate),
      relevance: undefined,
    });
  }

  return results;
}

function extractCells(rowHtml) {
  const cells = [];
  const cellPattern = /<td\b[^>]*>([\s\S]*?)<\/td>/gi;

  let match;

  while ((match = cellPattern.exec(rowHtml)) !== null) {
    cells.push(match[1]);
  }

  return cells;
}

function extractViewHref(viewCell) {
  const linkPattern = /<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>/i;
  const match = viewCell.match(linkPattern);

  if (!match) {
    return null;
  }

  const href = decodeHtmlEntities(match[1]).trim();

  if (!href) {
    return null;
  }

  if (!href.startsWith("/indiacode/handle/123456789/")) {
    return null;
  }

  if (href.includes("/browse")) {
    return null;
  }

  if (!/\/handle\/123456789\/\d+(?:[/?#]|$)/.test(href)) {
    return null;
  }

  return href;
}

function buildDocumentUrl(href) {
  try {
    const url = new URL(href, `${INDIA_CODE_ORIGIN}/`);

    if (url.origin !== INDIA_CODE_ORIGIN) {
      return null;
    }

    if (!url.pathname.startsWith("/indiacode/handle/123456789/")) {
      return null;
    }

    if (url.pathname.includes("/browse")) {
      return null;
    }

    return url.toString();
  } catch {
    return null;
  }
}

function cleanHtmlText(value) {
  return decodeHtmlEntities(
    String(value || "")
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function decodeHtmlEntities(value) {
  return String(value || "")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&apos;/gi, "'")
    .replace(/&nbsp;/gi, " ")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function normalizePublishedDate(value) {
  const match = String(value || "")
    .trim()
    .match(/^(\d{1,2})-([A-Za-z]{3})-(\d{4})$/);

  if (!match) {
    return undefined;
  }

  const [, day, monthName, year] = match;

  const months = {
    Jan: "01",
    Feb: "02",
    Mar: "03",
    Apr: "04",
    May: "05",
    Jun: "06",
    Jul: "07",
    Aug: "08",
    Sep: "09",
    Oct: "10",
    Nov: "11",
    Dec: "12",
  };

  const month = months[
    monthName.charAt(0).toUpperCase() +
      monthName.slice(1).toLowerCase()
  ];

  if (!month) {
    return undefined;
  }

  return `${year}-${month}-${String(day).padStart(2, "0")}`;
}

function buildCitation(actNumber, enactmentDate) {
  const numberMatch = String(actNumber || "").match(/\d+/);
  const yearMatch = String(enactmentDate || "").match(/(\d{4})$/);

  if (!numberMatch || !yearMatch) {
    return undefined;
  }

  return `Act No. ${numberMatch[0]} of ${yearMatch[1]}`;
}

module.exports = {
  ServerIndiaCodeDocumentSearcher,
  buildIndiaCodeSearchUrl,
  parseIndiaCodeSearchResults,
};
