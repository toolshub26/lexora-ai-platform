import { describe, expect, it } from "vitest";
import {
  InMemoryLegalSourceFetcher,
  type LegalSourceFetchRequest,
  type LegalSourceFetchResponse,
} from "@/features/legal-research/source-fetcher";

describe("Legal Source Fetcher", () => {
  it("should fetch a source through an injected transport", async () => {
    const transport = async (
      request: LegalSourceFetchRequest,
    ): Promise<LegalSourceFetchResponse> => {
      expect(request.url).toBe(
        "https://example.gov/legal/source",
      );

      return {
        status: 200,
        contentType: "text/html",
        finalUrl: "https://example.gov/legal/source",
        body: "<html>verified source content</html>",
      };
    };

    const fetcher = new InMemoryLegalSourceFetcher(
      transport,
    );

    const result = await fetcher.fetch({
      url: "https://example.gov/legal/source",
    });

    expect(result).toEqual({
      status: 200,
      contentType: "text/html",
      finalUrl: "https://example.gov/legal/source",
      body: "<html>verified source content</html>",
    });
  });

  it("should keep retrieval separate from legal verification", async () => {
    const fetcher = new InMemoryLegalSourceFetcher(
      async () => ({
        status: 200,
        contentType: "text/plain",
        finalUrl: "https://example.gov/source",
        body: "source content",
      }),
    );

    const result = await fetcher.fetch({
      url: "https://example.gov/source",
    });

    expect(result).not.toHaveProperty(
      "verificationStatus",
    );
  });
});
