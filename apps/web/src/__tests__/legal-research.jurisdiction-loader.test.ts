import { describe, expect, it } from "vitest";

import {
  loadLegalJurisdictions,
} from "../features/legal-research/jurisdiction-loader";

describe("loadLegalJurisdictions", () => {
  it("returns the canonical legal jurisdiction dataset", async () => {
    const jurisdictions = await loadLegalJurisdictions();

    expect(jurisdictions).toHaveLength(5319);

    expect(
      jurisdictions.filter(
        (jurisdiction) => jurisdiction.level === "country",
      ),
    ).toHaveLength(249);

    expect(
      jurisdictions.filter(
        (jurisdiction) => jurisdiction.level !== "country",
      ),
    ).toHaveLength(5070);

    expect(jurisdictions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "country:IN",
          name: "India",
          level: "country",
          countryCode: "IN",
          active: true,
        }),
        expect.objectContaining({
          id: "IN-JK",
          name: "Jammu and Kashmīr",
          countryCode: "IN",
          parentJurisdictionId: "country:IN",
          active: true,
        }),
      ]),
    );
  });

  it("contains unique jurisdiction IDs and valid parent references", async () => {
    const jurisdictions = await loadLegalJurisdictions();
    const ids = new Set(
      jurisdictions.map((jurisdiction) => jurisdiction.id),
    );

    expect(ids.size).toBe(jurisdictions.length);

    for (const jurisdiction of jurisdictions) {
      if (jurisdiction.parentJurisdictionId) {
        expect(ids.has(jurisdiction.parentJurisdictionId)).toBe(
          true,
        );
      }
    }
  });

  it("returns independent array instances", async () => {
    const first = await loadLegalJurisdictions();
    const second = await loadLegalJurisdictions();

    expect(first).not.toBe(second);
    expect(first).toEqual(second);
  });
});
