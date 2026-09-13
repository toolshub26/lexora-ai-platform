import { describe, expect, it } from "vitest";

import {
  createLegalJurisdictionRegistry,
} from "../features/legal-research/jurisdiction-registry";

describe("createLegalJurisdictionRegistry", () => {
  it("creates a registry from the canonical jurisdiction dataset", async () => {
    const registry = await createLegalJurisdictionRegistry();

    expect(registry.getById("country:IN")?.name).toBe("India");
    expect(registry.getById("IN-JK")?.name).toBe(
      "Jammu and Kashmīr",
    );
  });

  it("resolves country and direct children from the dataset", async () => {
    const registry = await createLegalJurisdictionRegistry();

    expect(registry.getCountry("in")?.id).toBe("country:IN");

    const children = registry.getChildren("country:IN");

    expect(children.length).toBeGreaterThan(0);
    expect(
      children.some((jurisdiction) => jurisdiction.id === "IN-JK"),
    ).toBe(true);
  });
});
