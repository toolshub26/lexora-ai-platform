"use strict";

const { request } = require("undici");

const SUPLIS_ORIGIN =
  "https://registry.sci.gov.in";

const SUPLIS_FORM_URL =
  `${SUPLIS_ORIGIN}/library-portal/suplis/famous.asp`;

const SUPLIS_SEARCH_URL =
  `${SUPLIS_ORIGIN}/library-portal/suplis/famoustest.asp`;

const USER_AGENT = "Mozilla/5.0";

class SupremeCourtSuplisSession {
  async getDetail(caseId) {
    const normalizedCaseId = String(caseId || "").trim();

    if (!/^\d+$/.test(normalizedCaseId)) {
      throw new Error("A valid SUPLIS case ID is required.");
    }

    const sessionResponse = await this.request(
      SUPLIS_FORM_URL,
      {
        method: "GET",
        headers: {
          "user-agent": USER_AGENT,
        },
      },
    );

    const setCookie = getSetCookieHeader(sessionResponse);

    if (!setCookie) {
      throw new Error(
        "Supreme Court SUPLIS session cookie was not provided.",
      );
    }

    const cookie = setCookie.split(";")[0].trim();

    const detailUrl =
      SUPLIS_ORIGIN +
      "/library-portal/suplis/famous2.asp?case1=" +
      encodeURIComponent(normalizedCaseId);

    const response = await this.request(detailUrl, {
      method: "GET",
      headers: {
        "user-agent": USER_AGENT,
        cookie,
      },
    });

    return {
      statusCode: response.statusCode,
      contentType: getHeader(
        response.headers,
        "content-type",
      ),
      body: await response.body.text(),
    };
  }

  constructor(options = {}) {
    this.request =
      typeof options.request === "function"
        ? options.request
        : request;
  }

  async search(query, famtype = "W") {
    const sessionResponse = await this.request(
      SUPLIS_FORM_URL,
      {
        method: "GET",
        headers: {
          "user-agent": USER_AGENT,
        },
      },
    );

    const setCookie =
      getSetCookieHeader(sessionResponse);

    if (!setCookie) {
      throw new Error(
        "Supreme Court SUPLIS session cookie was not provided.",
      );
    }

    const cookie = setCookie
      .split(";")[0]
      .trim();

    const body =
      `famname=${encodeURIComponent(String(query || ""))}` +
      "&famtype=" + encodeURIComponent(String(famtype || "W")) +
      "&submit1=SUBMIT";

    const searchResponse = await this.request(
      SUPLIS_SEARCH_URL,
      {
        method: "POST",
        headers: {
          "user-agent": USER_AGENT,
          "content-type":
            "application/x-www-form-urlencoded",
          cookie,
        },
        body,
      },
    );

    const responseBody =
      await searchResponse.body.text();

    return {
      statusCode: searchResponse.statusCode,
      contentType:
        getHeader(
          searchResponse.headers,
          "content-type",
        ),
      body: responseBody,
    };
  }
}

function getSetCookieHeader(response) {
  if (!response?.headers) {
    return "";
  }

  if (
    typeof response.headers.getSetCookie === "function"
  ) {
    return response.headers
      .getSetCookie()
      .find(Boolean) || "";
  }

  const value =
    response.headers["set-cookie"];

  if (Array.isArray(value)) {
    return value.find(Boolean) || "";
  }

  return String(value || "");
}

function getHeader(headers, name) {
  if (!headers) {
    return "";
  }

  if (
    typeof headers.get === "function"
  ) {
    return String(headers.get(name) || "");
  }

  return String(
    headers[name] ||
      headers[name.toLowerCase()] ||
      "",
  );
}

module.exports = {
  SupremeCourtSuplisSession,
  getSetCookieHeader,
};
