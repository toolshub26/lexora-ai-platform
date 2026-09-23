"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");

const {
  SupremeCourtSuplisSession,
  getSetCookieHeader,
} = require("./supreme-court-suplis-session");

test("extracts SUPLIS Set-Cookie header", () => {
  assert.equal(
    getSetCookieHeader({
      headers: {
        "set-cookie":
          "ASPSESSIONIDSQSDATQC=ABC123; path=/",
      },
    }),
    "ASPSESSIONIDSQSDATQC=ABC123; path=/",
  );
});

test("runs GET session bootstrap then POST search with same cookie", async () => {
  const calls = [];

  const session = new SupremeCourtSuplisSession({
    request: async (url, options) => {
      calls.push({ url, options });

      if (calls.length === 1) {
        return {
          statusCode: 200,
          headers: {
            "set-cookie":
              "ASPSESSIONIDSQSDATQC=ABC123; path=/",
          },
          body: {
            async text() {
              return "<html>form</html>";
            },
          },
        };
      }

      return {
        statusCode: 200,
        headers: {
          "content-type": "text/html",
        },
        body: {
          async text() {
            return "<html>LIST OF CASES</html>";
          },
        },
      };
    },
  });

  const result =
    await session.search("Kesavananda Bharati");

  assert.equal(calls.length, 2);

  assert.match(
    calls[0].url,
    /\/library-portal\/suplis\/famous\.asp$/,
  );

  assert.equal(
    calls[0].options.method,
    "GET",
  );

  assert.match(
    calls[1].url,
    /\/library-portal\/suplis\/famoustest\.asp$/,
  );

  assert.equal(
    calls[1].options.method,
    "POST",
  );

  assert.equal(
    calls[1].options.headers.cookie,
    "ASPSESSIONIDSQSDATQC=ABC123",
  );

  assert.match(
    calls[1].options.body,
    /famname=Kesavananda%20Bharati/,
  );

  assert.match(
    calls[1].options.body,
    /famtype=W/,
  );

  assert.equal(result.statusCode, 200);
  assert.equal(result.contentType, "text/html");
  assert.equal(
    result.body,
    "<html>LIST OF CASES</html>",
  );
});

test("fails when SUPLIS does not provide a session cookie", async () => {
  const session = new SupremeCourtSuplisSession({
    request: async () => ({
      statusCode: 200,
      headers: {},
      body: {
        async text() {
          return "<html>form</html>";
        },
      },
    }),
  });

  await assert.rejects(
    () => session.search("Kesavananda Bharati"),
    /SUPLIS session cookie was not provided/,
  );
});
