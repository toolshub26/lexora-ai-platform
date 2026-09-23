"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ServerSupremeCourtDocumentSearcher,
  parseSupremeCourtSearchResults,
} = require("./supreme-court-discovery");

const SAMPLE_HTML = `
<HTML>
<HEAD><TITLE>LIST OF CASES</TITLE></HEAD>
<BODY>
<table width=100% border=1>
<tr>
<td align=right valign=top width=10%>
<FONT color=Blue size=2><strong>1.</strong></font>
<td align=left width=80%>
<FONT color="brown" size=2>
&nbsp;<b style="color:red">KESAVANANDA BHARATI</b><br>
<a href="famous2.asp?case1=19037">
<FONT color=Maroon size=2>
<strong>KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA
</a>
<FONT color=Blue size=2> DOJ :</font> 24/04/1973</a></strong></font>
<b><strong><font color=green size=2></b>
JUDGEMENT
<br>
<b><FONT color=blue size=2></b>
</font>
&nbsp;&nbsp;&nbsp;<b style="color:blue">
<br><b style="COLOR: blue">CITATION(s)</b>
<b style="COLOR: brown">1973&nbsp;AIR&nbsp;1461</b>
<b style="COLOR: brown">1973 ( 0 ) Suppl. SCR 1</b>
<b style="COLOR: brown">1973 ( 4 ) SCC 225</b>
</td>
</tr>
</table>
</BODY>
</HTML>
`;

test("parses official SUPLIS case result", () => {
  const results = parseSupremeCourtSearchResults(SAMPLE_HTML);

  assert.equal(results.length, 1);
  assert.equal(results[0].metadata.suplisCaseId, "19037");
  assert.equal(
    results[0].title,
    "KESAVANANDA BHARATI SRIPADAGALVARU .Vs. STATE OF KERALA",
  );
  assert.equal(
    results[0].publishedAt,
    "1973-04-24T00:00:00.000Z",
  );
  assert.deepEqual(results[0].metadata.citations, [
    "1973 AIR 1461",
    "1973 ( 0 ) Suppl. SCR 1",
    "1973 ( 4 ) SCC 225",
  ]);
});

test("returns no documents when SUPLIS reports no results", () => {
  const html = `
    <HTML>
      <HEAD><TITLE>LIST OF CASES</TITLE></HEAD>
      <BODY>Nothing found. Try again.</BODY>
    </HTML>
  `;

  assert.deepEqual(
    parseSupremeCourtSearchResults(html),
    [],
  );
});

test("searcher validates the Supreme Court source", async () => {
  const searcher = new ServerSupremeCourtDocumentSearcher({
    fetch: async () => ({
      status: 200,
      contentType: "text/html",
      body: SAMPLE_HTML,
    }),
  });

  await assert.rejects(
    () =>
      searcher.search({
        query: "Kesavananda Bharati",
        source: {
          id: "portal:in:india-code",
        },
      }),
    /Supreme Court source is required/,
  );
});

test("searcher returns parsed SUPLIS documents", async () => {
  const searcher = new ServerSupremeCourtDocumentSearcher({
    fetch: async () => {
      throw new Error("fetch should not be called directly");
    },
    session: {
      search: async (query, famtype) => {
        assert.equal(query, "Kesavananda Bharati");
        assert.equal(famtype, "W");

        return {
          statusCode: 200,
          contentType: "text/html",
          body: SAMPLE_HTML,
        };
      },
      getDetail: async (caseId) => {
        assert.equal(caseId, "19037");

        return {
          statusCode: 200,
          contentType: "text/html",
          body:
            "Case No.: W.P.(C) 135 OF 1970 " +
            "Date Of Judgement: 24/04/1973",
        };
      },
    },
  });

  const results = await searcher.search({
    query: "Kesavananda Bharati",
    source: {
      id: "portal:in:supreme-court",
    },
  });

  assert.equal(results.length, 1);
  assert.equal(
    results[0].metadata.suplisCaseId,
    "19037",
  );
  assert.equal(
    results[0].metadata.caseNumber,
    "W.P.(C) 135 OF 1970",
  );
});

test("empty query returns no documents", async () => {
  const searcher = new ServerSupremeCourtDocumentSearcher({
    fetch: async () => {
      throw new Error("fetch must not be called");
    },
  });

  assert.deepEqual(
    await searcher.search({
      query: "   ",
      source: {
        id: "portal:in:supreme-court",
      },
    }),
    [],
  );
});
