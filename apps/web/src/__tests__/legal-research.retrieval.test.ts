import { describe, expect, it } from "vitest";
import {
  EmptyLegalSourceRetriever,
  type LegalRetrievalRequest,
} from "../features/legal-research/retrieval";

describe("EmptyLegalSourceRetriever", () => {
  it("returns an empty retrieval result", async () => {
    const retriever = new EmptyLegalSourceRetriever();

    const request: LegalRetrievalRequest = {
      query: {
        query: "What is the limitation period?",
        sources: ["cases", "statutes"],
      },
    };

    const result = await retriever.retrieve(request);

    expect(result.sources).toEqual([]);
    expect(result.evidence).toEqual([]);
    expect(result.researchSources).toEqual([]);
  });

  it("implements the provider-neutral retriever contract", async () => {
    const retriever = new EmptyLegalSourceRetriever();

    const result = await retriever.retrieve({
      query: {
        query: "Test research query",
        jurisdiction: {
          countryCode: "IN",
          jurisdictionId: "india",
        },
        practiceArea: "civil",
        sources: ["cases"],
      },
    });

    expect(result).toEqual({
      sources: [],
      evidence: [],
      researchSources: [],
    });
  });
});
