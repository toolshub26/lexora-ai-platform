import type {
  LegalAuthorityDataset,
  LegalAuthorityDatasetSource,
} from "@/features/legal-research/authority-dataset";

describe("LegalAuthorityDataset contract", () => {
  it("should represent dataset provenance", () => {
    const source: LegalAuthorityDatasetSource = {
      name: "official-government-sources",
      version: "1.0.0",
      standard: "Lexora Legal Authority Dataset",
    };

    const dataset: LegalAuthorityDataset = {
      schemaVersion: "1.0.0",
      source,
      generatedAt: "2026-09-13T00:00:00.000Z",
      authorities: [],
    };

    expect(dataset.schemaVersion).toBe("1.0.0");
    expect(dataset.source.name).toBe(
      "official-government-sources",
    );
    expect(dataset.source.version).toBe("1.0.0");
    expect(dataset.source.standard).toBe(
      "Lexora Legal Authority Dataset",
    );
    expect(dataset.authorities).toEqual([]);
  });

  it("should allow authorities to reference jurisdictions and parents", () => {
    const source: LegalAuthorityDatasetSource = {
      name: "official-government-sources",
      version: "1.0.0",
      standard: "Lexora Legal Authority Dataset",
    };

    const dataset: LegalAuthorityDataset = {
      schemaVersion: "1.0.0",
      source,
      generatedAt: "2026-09-13T00:00:00.000Z",
      authorities: [
        {
          id: "example:authority",
          name: "Example Authority",
          type: "court",
          countryCode: "XX",
          jurisdictionId: "country:XX",
          parentAuthorityId: "example:parent",
          officialName: "Example Official Authority",
          officialUrl: "https://example.gov",
          active: true,
        },
      ],
    };

    expect(dataset.authorities).toHaveLength(1);
    expect(dataset.authorities[0].jurisdictionId).toBe(
      "country:XX",
    );
    expect(dataset.authorities[0].parentAuthorityId).toBe(
      "example:parent",
    );
  });
});
