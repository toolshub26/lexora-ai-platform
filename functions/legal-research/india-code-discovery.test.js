"use strict";

const assert = require("node:assert/strict");
const test = require("node:test");

const {
  ServerIndiaCodeDocumentSearcher,
} = require("./india-code-discovery");

const INDIA_CODE_SOURCE = {
  id: "portal:in:india-code",
  title: "India Code",
  citation: "India Code — Official Government of India Legal Repository",
  sourceType: "official-publications",
  authorityLevel: "primary",
  jurisdiction: {
    countryCode: "IN",
    jurisdictionId: "country:IN",
  },
  sourceUrl: "https://www.indiacode.nic.in/",
  canonicalUrl: "https://www.indiacode.nic.in/",
  availability: "available",
  retrievedAt: new Date("2026-09-16T00:00:00.000Z"),
};

const SEARCH_HTML = `
<html>
  <body>
    <div class="panel panel-info table-responsive">
      <table align="center" class="table table-hover">
        <tr>
          <th>Enactment Date</th>
          <th>Act Number</th>
          <th>Short Title</th>
          <th>View</th>
        </tr>
        <tr>
          <td>9-Dec-1881</td>
          <td><em>26</em></td>
          <td>
            The <font color="#F778A1"><b>Negotiable</b></font>
            <font color="#F778A1"><b>Instruments</b></font>
            <font color="#F778A1"><b>Act,</b></font> 1881
          </td>
          <td>
            <a href="/indiacode/handle/123456789/13092?view_type=search&col=123456789/2490">
              View...
            </a>
          </td>
        </tr>
        <tr>
          <td>1-Jul-1899</td>
          <td><em>2</em></td>
          <td>The Indian Stamp Act,1899</td>
          <td>
            <a href="/indiacode/handle/123456789/5746?view_type=search&col=123456789/2497">
              View...
            </a>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>
`;

test("India Code searcher requires a fetch function", () => {
  assert.throws(
    () => new ServerIndiaCodeDocumentSearcher(),
    /fetch function is required/,
  );
});

test("India Code searcher uses the official simple-search endpoint", async () => {
  let requestedUrl = null;

  const searcher = new ServerIndiaCodeDocumentSearcher({
    fetch: async (url) => {
      requestedUrl = url;

      return {
        status: 200,
        contentType: "text/html",
        finalUrl: url,
        body: SEARCH_HTML,
      };
    },
  });

  await searcher.search({
    query: "Negotiable Instruments Act",
    source: INDIA_CODE_SOURCE,
  });

  assert.equal(
    requestedUrl,
    "https://www.indiacode.nic.in/indiacode/simple-search?query=Negotiable+Instruments+Act",
  );
});

test("India Code searcher extracts actual document results", async () => {
  const searcher = new ServerIndiaCodeDocumentSearcher({
    fetch: async () => ({
      status: 200,
      contentType: "text/html",
      finalUrl:
        "https://www.indiacode.nic.in/indiacode/simple-search?query=Negotiable+Instruments+Act",
      body: SEARCH_HTML,
    }),
  });

  const results = await searcher.search({
    query: "Negotiable Instruments Act",
    source: INDIA_CODE_SOURCE,
  });

  assert.equal(results.length, 2);

  assert.equal(results[0].title, "The Negotiable Instruments Act, 1881");
  assert.equal(
    results[0].documentUrl,
    "https://www.indiacode.nic.in/indiacode/handle/123456789/13092?view_type=search&col=123456789/2490",
  );

  assert.equal(results[0].publishedAt, "1881-12-09");
  assert.equal(results[0].citation, "Act No. 26 of 1881");

  assert.equal(results[1].title, "The Indian Stamp Act,1899");
  assert.equal(
    results[1].documentUrl,
    "https://www.indiacode.nic.in/indiacode/handle/123456789/5746?view_type=search&col=123456789/2497",
  );
});

test("India Code searcher does not return navigation handles", async () => {
  const html = `
    <html>
      <body>
        <a href="/indiacode/handle/123456789/1362/browse?type=shorttitle">
          Short Title
        </a>

        <table>
          <tr>
            <th>Enactment Date</th>
            <th>Act Number</th>
            <th>Short Title</th>
            <th>View</th>
          </tr>
          <tr>
            <td>9-Dec-1881</td>
            <td>26</td>
            <td>The Negotiable Instruments Act, 1881</td>
            <td>
              <a href="/indiacode/handle/123456789/13092?view_type=search">
                View...
              </a>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const searcher = new ServerIndiaCodeDocumentSearcher({
    fetch: async () => ({
      status: 200,
      contentType: "text/html",
      finalUrl:
        "https://www.indiacode.nic.in/indiacode/simple-search?query=test",
      body: html,
    }),
  });

  const results = await searcher.search({
    query: "test",
    source: INDIA_CODE_SOURCE,
  });

  assert.equal(results.length, 1);
  assert.match(results[0].documentUrl, /\/handle\/123456789\/13092\?/);
  assert.doesNotMatch(results[0].documentUrl, /browse/);
});

test("India Code searcher returns an empty array for no result rows", async () => {
  const searcher = new ServerIndiaCodeDocumentSearcher({
    fetch: async () => ({
      status: 200,
      contentType: "text/html",
      finalUrl:
        "https://www.indiacode.nic.in/indiacode/simple-search?query=unknown",
      body: `
        <html>
          <body>
            <table>
              <tr>
                <th>Enactment Date</th>
                <th>Act Number</th>
                <th>Short Title</th>
                <th>View</th>
              </tr>
            </table>
          </body>
        </html>
      `,
    }),
  });

  const results = await searcher.search({
    query: "unknown",
    source: INDIA_CODE_SOURCE,
  });

  assert.deepEqual(results, []);
});

test("India Code searcher rejects a non-India-Code source binding", async () => {
  const searcher = new ServerIndiaCodeDocumentSearcher({
    fetch: async () => ({
      status: 200,
      contentType: "text/html",
      finalUrl: "https://example.com/search",
      body: SEARCH_HTML,
    }),
  });

  await assert.rejects(
    searcher.search({
      query: "test",
      source: {
        ...INDIA_CODE_SOURCE,
        id: "source:attacker",
      },
    }),
    /India Code source is required/,
  );
});
