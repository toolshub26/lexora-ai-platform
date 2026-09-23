"use strict";

const net = require("node:net");
const { Client } = require("undici");

const DEFAULT_TIMEOUT_MS = 10_000;
const DEFAULT_MAX_RESPONSE_BYTES = 2 * 1024 * 1024;

const ALLOWED_CONTENT_TYPES = new Set([
  "text/html",
  "text/plain",
  "application/xhtml+xml",
  "application/xml",
  "text/xml",
  "application/pdf",
]);

const PDF_MAGIC = Buffer.from("%PDF-");
const PDF_MAGIC_SEARCH_BYTES = 1024;

class ServerLegalSourceFetcher {
  constructor(options = {}) {
    this.transport = options.transport || defaultTransport;
    this.resolver = options.resolver || defaultResolver;
    this.timeoutMs = options.timeoutMs || DEFAULT_TIMEOUT_MS;
    this.maxResponseBytes =
      options.maxResponseBytes || DEFAULT_MAX_RESPONSE_BYTES;
  }

  async fetch(request) {
    if (
      !request ||
      typeof request !== "object" ||
      typeof request.url !== "string"
    ) {
      throw new Error("A valid source URL is required.");
    }

    const url = parseAndValidateUrl(request.url);

    let resolvedAddresses = [url.hostname];

    if (!net.isIP(url.hostname)) {
      try {
        resolvedAddresses = await withTimeout(
          this.resolver(url.hostname),
          this.timeoutMs,
        );
      } catch {
        throw new Error("Source hostname resolution failed.");
      }

      if (
        !Array.isArray(resolvedAddresses) ||
        resolvedAddresses.length === 0 ||
        resolvedAddresses.some((address) =>
          isUnsafeResolvedAddress(address),
        )
      ) {
        throw new Error("Unsafe resolved network target.");
      }
    }

    const response = await withTimeout(
      this.transport(
        {
          url: url.toString(),
          resolvedAddresses: net.isIP(url.hostname)
            ? [url.hostname]
            : resolvedAddresses,
        },
        {
          timeoutMs: this.timeoutMs,
          maxResponseBytes: this.maxResponseBytes,
        },
      ),
      this.timeoutMs,
    );

    if (!response || typeof response !== "object") {
      throw new Error("Source fetch failed.");
    }

    const finalUrl = parseAndValidateUrl(
      response.url || url.toString(),
    );

    if (
      typeof response.status !== "number" ||
      response.status < 200 ||
      response.status >= 300
    ) {
      throw new Error(
        `Source fetch failed with HTTP status ${response.status}.`,
      );
    }

    const contentType = getContentType(response.headers);

    if (!isAllowedContentType(contentType)) {
      throw new Error(
        `Unsupported source content type: ${contentType || "unknown"}.`,
      );
    }

    const rawBody = Buffer.isBuffer(response.body)
      ? response.body
      : Buffer.from(String(response.body ?? ""), "utf8");

    if (rawBody.length > this.maxResponseBytes) {
      throw new Error(
        "Source response exceeds the maximum allowed size.",
      );
    }

    if (contentType === "application/pdf") {
      validatePdfSignature(rawBody);
    }

    const body =
      contentType === "application/pdf"
        ? rawBody
        : rawBody.toString("utf8");

    return {
      status: response.status,
      contentType,
      finalUrl: finalUrl.toString(),
      body,
    };
  }
}

function withTimeout(promise, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Source fetch timed out."));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function parseAndValidateUrl(rawUrl) {
  let url;

  try {
    url = new URL(String(rawUrl).trim());
  } catch {
    throw new Error("Invalid source URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Unsupported URL scheme.");
  }

  if (url.username || url.password) {
    throw new Error("URL credentials are not allowed.");
  }

  if (!url.hostname) {
    throw new Error("Invalid source URL.");
  }

  if (isUnsafeHostname(url.hostname)) {
    throw new Error("Unsafe URL target.");
  }

  return url;
}

function isUnsafeHostname(hostname) {
  const normalized = hostname
    .toLowerCase()
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/\.$/, "");

  if (
    normalized === "localhost" ||
    normalized.endsWith(".localhost") ||
    normalized === "local"
  ) {
    return true;
  }

  const ipVersion = net.isIP(normalized);

  if (ipVersion === 4) {
    return isUnsafeIPv4(normalized);
  }

  if (ipVersion === 6) {
    return isUnsafeIPv6(normalized);
  }

  return false;
}

function isUnsafeIPv4(address) {
  const octets = address.split(".").map(Number);

  if (octets.length !== 4 || octets.some((value) => !Number.isInteger(value))) {
    return true;
  }

  const [a, b, c] = octets;

  return (
    a === 0 ||
    a === 10 ||
    a === 127 ||
    (a === 100 && b >= 64 && b <= 127) ||
    (a === 169 && b === 254) ||
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 0) ||
    (a === 192 && b === 168) ||
    (a === 198 && (b === 18 || b === 19)) ||
    (a === 198 && b === 51 && c === 100) ||
    (a === 203 && b === 0 && c === 113) ||
    a >= 224
  );
}

function isUnsafeIPv6(address) {
  const normalized = address.toLowerCase();

  return (
    normalized === "::" ||
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe8") ||
    normalized.startsWith("fe9") ||
    normalized.startsWith("fea") ||
    normalized.startsWith("feb")
  );
}

function getContentType(headers) {
  if (!headers || typeof headers !== "object") {
    return "";
  }

  const value =
    headers["content-type"] ||
    headers["Content-Type"] ||
    "";

  return String(value)
    .split(";", 1)[0]
    .trim()
    .toLowerCase();
}

function isAllowedContentType(contentType) {
  return ALLOWED_CONTENT_TYPES.has(contentType);
}

function validatePdfSignature(body) {
  if (!Buffer.isBuffer(body)) {
    throw new Error("Invalid PDF response body.");
  }

  const searchEnd = Math.min(body.length, PDF_MAGIC_SEARCH_BYTES);
  const headerOffset = body.indexOf(PDF_MAGIC, 0, "utf8");

  if (headerOffset < 0 || headerOffset >= searchEnd) {
    throw new Error("Invalid PDF response signature.");
  }
}

async function defaultResolver(hostname) {
  const dns = require("node:dns").promises;

  const records = await dns.lookup(hostname, {
    all: true,
    verbatim: true,
  });

  return records.map((record) => record.address);
}

function isUnsafeResolvedAddress(address) {
  const normalized = String(address)
    .toLowerCase()
    .replace(/^\[/, "")
    .replace(/\]$/, "");

  const ipVersion = net.isIP(normalized);

  if (ipVersion === 4) {
    return isUnsafeIPv4(normalized);
  }

  if (ipVersion === 6) {
    return isUnsafeIPv6(normalized);
  }

  return true;
}

function createPinnedLookup(addresses) {
  if (!Array.isArray(addresses) || addresses.length === 0) {
    throw new Error("At least one validated address is required.");
  }

  const pinnedAddresses = addresses.map((address) => {
    const normalized = String(address)
      .toLowerCase()
      .replace(/^\[/, "")
      .replace(/\]$/, "");

    if (!net.isIP(normalized) || isUnsafeResolvedAddress(normalized)) {
      throw new Error("Invalid or unsafe pinned address.");
    }

    return normalized;
  });

  return (hostname, lookupOptions, callback) => {
    const family =
      lookupOptions && Number.isInteger(lookupOptions.family)
        ? lookupOptions.family
        : 0;

    const matches =
      family === 0
        ? pinnedAddresses
        : pinnedAddresses.filter(
            (address) => net.isIP(address) === family,
          );

    if (matches.length === 0) {
      callback(
        new Error(
          "No validated address matches the requested address family.",
        ),
      );
      return;
    }

    if (lookupOptions?.all) {
      callback(
        null,
        matches.map((address) => ({
          address,
          family: net.isIP(address),
        })),
      );
      return;
    }

    const address = matches[0];

    callback(null, address, net.isIP(address));
  };
}

async function defaultTransport(request, options) {
  const url = new URL(request.url);
  const lookup = createPinnedLookup(request.resolvedAddresses);

  const clientFactory =
    options.clientFactory ||
    ((origin, clientOptions) => new Client(origin, clientOptions));

  const client = clientFactory(url.origin, {
    connect: {
      lookup,
    },
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, options.timeoutMs);

  try {
    const response = await client.request({
      path: `${url.pathname}${url.search}`,
      method: "GET",
      signal: controller.signal,
      headers: {
        Accept:
          "text/html, application/xhtml+xml, text/plain, application/xml, text/xml, application/pdf",
        "User-Agent": "Lexora-LegalResearch/1.0",
      },
    });

    const headers = Object.fromEntries(
      Object.entries(response.headers).map(([key, value]) => [
        key,
        Array.isArray(value) ? value.join(", ") : String(value),
      ]),
    );

    const contentLength = headers["content-length"];

    if (
      contentLength &&
      Number.isFinite(Number(contentLength)) &&
      Number(contentLength) > options.maxResponseBytes
    ) {
      response.body.destroy();
      throw new Error(
        "Source response exceeds the maximum allowed size.",
      );
    }

    const chunks = [];
    let totalBytes = 0;

    for await (const chunk of response.body) {
      const buffer = Buffer.isBuffer(chunk)
        ? chunk
        : Buffer.from(chunk);

      totalBytes += buffer.length;

      if (totalBytes > options.maxResponseBytes) {
        response.body.destroy();
        throw new Error(
          "Source response exceeds the maximum allowed size.",
        );
      }

      chunks.push(buffer);
    }

    return {
      status: response.statusCode,
      headers,
      url: request.url,
      body:
        getContentType(headers) === "application/pdf"
          ? Buffer.concat(chunks)
          : Buffer.concat(chunks).toString("utf8"),
    };
  } catch (error) {
    if (
      error?.name === "AbortError" ||
      error?.code === "UND_ERR_ABORTED"
    ) {
      throw new Error("Source fetch timed out.");
    }

    if (
      error?.message ===
      "Source response exceeds the maximum allowed size."
    ) {
      throw error;
    }

    throw new Error("Source fetch failed.");
  } finally {
    clearTimeout(timeout);
    await client.close().catch(() => {});
  }
}

module.exports = {
  ServerLegalSourceFetcher,
  createPinnedLookup,
  defaultTransport,
};
