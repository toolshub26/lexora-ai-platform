import { describe, expect, it } from "vitest";

import {
  EmptyLegalSourceDiscoveryProvider,
  type LegalSourceDiscoveryRequest,
} from "../features/legal-research/discovery";

describe("EmptyLegalSourceDiscoveryProvider", () => {
  it("returns an empty discovery result", async () => {
    const provider = new EmptyLegalSourceDiscoveryProvider();

    const request: LegalSourceDiscoveryRequest = {
      query: {
        query: "What is the limitation period?",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "india",
        },
        practiceArea: "civil",
        sources: ["cases", "statutes"],
      },
    };

    const result = await provider.discover(request);

    expect(result).toEqual({
      candidates: [],
    });
  });

  it("implements the provider-neutral discovery contract", async () => {
    const provider = new EmptyLegalSourceDiscoveryProvider();

    const result = await provider.discover({
      query: {
        query: "Test research query",
        sources: ["cases"],
      },
    });

    expect(result.candidates).toEqual([]);
  });
});
