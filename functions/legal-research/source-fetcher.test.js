"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ServerLegalSourceFetcher,
} = require("./source-fetcher");

function createTransport(response) {
  return async () => response;
}

test("accepts a valid HTTPS source", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
      url: "https://example.gov/source",
      body: "<html>legal source</html>",
    }),
  });

  const result = await fetcher.fetch({
    url: "https://example.gov/source",
  });

  assert.equal(result.status, 200);
  assert.equal(result.finalUrl, "https://example.gov/source");
  assert.equal(result.body, "<html>legal source</html>");
});

test("rejects unsupported URL schemes", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
      url: "file:///etc/passwd",
      body: "secret",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "file:///etc/passwd",
    }),
    /Unsupported URL scheme/,
  );
});

test("rejects URLs containing credentials", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      url: "https://example.gov/source",
      body: "source",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://user:password@example.gov/source",
    }),
    /URL credentials are not allowed/,
  );
});

test("rejects localhost targets", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      url: "https://localhost/source",
      body: "source",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://localhost/source",
    }),
    /Unsafe URL target/,
  );
});

test("rejects loopback IPv4 targets", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      url: "https://127.0.0.1/source",
      body: "source",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://127.0.0.1/source",
    }),
    /Unsafe URL target/,
  );
});

test("rejects private IPv4 targets", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      url: "https://10.0.0.1/source",
      body: "source",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://10.0.0.1/source",
    }),
    /Unsafe URL target/,
  );
});

test("rejects non-success HTTP responses", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 404,
      headers: {
        "content-type": "text/html",
      },
      url: "https://example.gov/missing",
      body: "not found",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://example.gov/missing",
    }),
    /Source fetch failed/,
  );
});

test("rejects disallowed content types", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "application/octet-stream",
      },
      url: "https://example.gov/source",
      body: "binary",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://example.gov/source",
    }),
    /Unsupported source content type/,
  );
});

test("enforces the configured response-size limit", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    maxResponseBytes: 10,
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
      url: "https://example.gov/source",
      body: "this response is too large",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://example.gov/source",
    }),
    /Source response exceeds the maximum allowed size/,
  );
});

test("rejects IPv6 loopback targets", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      url: "https://[::1]/source",
      body: "source",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://[::1]/source",
    }),
    /Unsafe URL target/,
  );
});

test("rejects IPv6 private targets", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      url: "https://[fd00::1]/source",
      body: "source",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://[fd00::1]/source",
    }),
    /Unsafe URL target/,
  );
});

test("rejects malformed URLs", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "text/html",
      },
      url: "https://example.gov/source",
      body: "source",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "not-a-valid-url",
    }),
    /Invalid source URL/,
  );
});

test("rejects redirects instead of following them automatically", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 302,
      headers: {
        location: "https://example.gov/redirected",
        "content-type": "text/html",
      },
      url: "https://example.gov/source",
      body: "",
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://example.gov/source",
    }),
    /Source fetch failed/,
  );
});

test("enforces the configured fetch timeout", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    timeoutMs: 20,
    transport: () =>
      new Promise(() => {
        // Intentionally never resolves.
      }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://example.gov/source",
    }),
    /timed out/,
  );
});

test("does not call the transport for an unsafe target", async () => {
  let transportCalled = false;

  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: async () => {
      transportCalled = true;

      return {
        status: 200,
        headers: {
          "content-type": "text/html",
        },
        url: "https://example.gov/source",
        body: "source",
      };
    },
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://127.0.0.1/source",
    }),
    /Unsafe URL target/,
  );

  assert.equal(transportCalled, false);
});

test("rejects a hostname that resolves to a private IPv4 address", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["10.0.0.5"],
    transport: async () => {
      throw new Error("Transport must not be called.");
    },
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://legal.example.gov/source",
    }),
    /Unsafe resolved network target/,
  );
});

test("rejects a hostname that resolves to a loopback IPv4 address", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["127.0.0.1"],
    transport: async () => {
      throw new Error("Transport must not be called.");
    },
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://legal.example.gov/source",
    }),
    /Unsafe resolved network target/,
  );
});

test("rejects a hostname when any resolved address is unsafe", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => [
      "93.184.216.34",
      "192.168.1.20",
    ],
    transport: async () => {
      throw new Error("Transport must not be called.");
    },
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://legal.example.gov/source",
    }),
    /Unsafe resolved network target/,
  );
});

test("accepts a hostname when all resolved addresses are public", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => [
      "93.184.216.34",
      "1.1.1.1",
    ],
    transport: async (request) => ({
      status: 200,
      headers: {
        "content-type": "text/plain",
      },
      url: request.url,
      body: "legal source",
    }),
  });

  const result = await fetcher.fetch({
    url: "https://legal.example.gov/source",
  });

  assert.equal(result.status, 200);
  assert.equal(result.body, "legal source");
});

test("rejects a hostname that resolves to IPv6 loopback", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["::1"],
    transport: async () => {
      throw new Error("Transport must not be called.");
    },
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://legal.example.gov/source",
    }),
    /Unsafe resolved network target/,
  );
});

test("rejects DNS resolution failure", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => {
      throw new Error("DNS failure");
    },
    transport: async () => {
      throw new Error("Transport must not be called.");
    },
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://legal.example.gov/source",
    }),
    /Source hostname resolution failed/,
  );
});

test("passes validated resolved addresses to the transport", async () => {
  let transportRequest;

  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => [
      "93.184.216.34",
      "1.1.1.1",
    ],
    transport: async (request) => {
      transportRequest = request;

      return {
        status: 200,
        headers: {
          "content-type": "text/plain",
        },
        url: request.url,
        body: "legal source",
      };
    },
  });

  await fetcher.fetch({
    url: "https://legal.example.gov/source",
  });

  assert.deepEqual(
    transportRequest.resolvedAddresses,
    ["93.184.216.34", "1.1.1.1"],
  );
});

test("pins DNS lookup to validated addresses", async () => {
  const { createPinnedLookup } = require("./source-fetcher");

  const lookup = createPinnedLookup([
    "93.184.216.34",
    "1.1.1.1",
  ]);

  const result = await new Promise((resolve, reject) => {
    lookup(
      "legal.example.gov",
      { all: true },
      (error, addresses) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(addresses);
      },
    );
  });

  assert.deepEqual(result, [
    { address: "93.184.216.34", family: 4 },
    { address: "1.1.1.1", family: 4 },
  ]);
});

test("default transport passes a pinned lookup to the HTTP client", async () => {
  const { defaultTransport } = require("./source-fetcher");

  let capturedOrigin;
  let capturedOptions;
  let closed = false;

  const fakeBody = {
    async *[Symbol.asyncIterator]() {
      yield Buffer.from("legal source");
    },
  };

  const clientFactory = (origin, options) => {
    capturedOrigin = origin;
    capturedOptions = options;

    return {
      async request() {
        return {
          statusCode: 200,
          headers: {
            "content-type": "text/plain",
          },
          body: fakeBody,
        };
      },

      async close() {
        closed = true;
      },
    };
  };

  const result = await defaultTransport(
    {
      url: "https://legal.example.gov/source",
      resolvedAddresses: ["93.184.216.34"],
    },
    {
      timeoutMs: 2000,
      maxResponseBytes: 1024 * 1024,
      clientFactory,
    },
  );

  assert.equal(capturedOrigin, "https://legal.example.gov");
  assert.equal(typeof capturedOptions.connect.lookup, "function");

  const addresses = await new Promise((resolve, reject) => {
    capturedOptions.connect.lookup(
      "legal.example.gov",
      { all: true },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );
  });

  assert.deepEqual(addresses, [
    {
      address: "93.184.216.34",
      family: 4,
    },
  ]);

  assert.equal(result.status, 200);
  assert.equal(result.body, "legal source");
  assert.equal(closed, true);
});

test("accepts a valid PDF response and preserves binary body", async () => {
  const pdfBody = Buffer.concat([
    Buffer.from("OZ\u0001\u0000", "binary"),
    Buffer.from("%PDF-1.7\n"),
    Buffer.from("1 0 obj\n<< /Type /Catalog >>\nendobj\n", "utf8"),
  ]);

  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "application/pdf",
      },
      url: "https://example.gov/judgment.pdf",
      body: pdfBody,
    }),
  });

  const result = await fetcher.fetch({
    url: "https://example.gov/judgment.pdf",
  });

  assert.equal(result.status, 200);
  assert.equal(result.contentType, "application/pdf");
  assert.equal(result.finalUrl, "https://example.gov/judgment.pdf");
  assert.ok(Buffer.isBuffer(result.body));
  assert.equal(result.body.indexOf(Buffer.from("%PDF-")), 4);
  assert.deepEqual(result.body, pdfBody);
});

test("rejects PDF responses without a valid PDF signature", async () => {
  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "application/pdf",
      },
      url: "https://example.gov/not-a-pdf.pdf",
      body: Buffer.from("this is not a PDF", "utf8"),
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://example.gov/not-a-pdf.pdf",
    }),
    /Invalid PDF response signature/,
  );
});

test("rejects PDF signatures beyond the first 1024 bytes", async () => {
  const body = Buffer.concat([
    Buffer.alloc(1024, 0),
    Buffer.from("%PDF-1.7\n", "ascii"),
  ]);

  const fetcher = new ServerLegalSourceFetcher({
    resolver: async () => ["93.184.216.34"],
    transport: createTransport({
      status: 200,
      headers: {
        "content-type": "application/pdf",
      },
      url: "https://example.gov/late-signature.pdf",
      body,
    }),
  });

  await assert.rejects(
    fetcher.fetch({
      url: "https://example.gov/late-signature.pdf",
    }),
    /Invalid PDF response signature/,
  );
});
