import { describe, expect, it } from "vitest";

import {
  ASSET_CLASSES,
  assetClassForUniverse,
  parseAssetClass,
} from "./asset-class";
import type { Universe } from "./types";

describe("assetClassForUniverse", () => {
  it("every universe maps to exactly one asset class", () => {
    const all: Universe[] = [
      "stocks",
      "sector-etfs",
      "industry-etfs",
      "country-etfs",
      "currencies",
      "commodities",
      "india",
      "hong-kong",
      "singapore",
      "japan",
      "europe",
      "fixed-income",
      "broad-market",
      "growth-value",
      "portfolio-etfs",
    ];
    for (const u of all) {
      const cls = assetClassForUniverse(u);
      expect(ASSET_CLASSES).toContain(cls);
    }
  });

  it("maps equity-backed universes to equity", () => {
    expect(assetClassForUniverse("stocks")).toBe("equity");
    expect(assetClassForUniverse("sector-etfs")).toBe("equity");
    expect(assetClassForUniverse("india")).toBe("equity");
    expect(assetClassForUniverse("europe")).toBe("equity");
  });

  it("maps non-equity universes correctly", () => {
    expect(assetClassForUniverse("commodities")).toBe("commodity");
    expect(assetClassForUniverse("fixed-income")).toBe("fixed-income");
    expect(assetClassForUniverse("currencies")).toBe("fx");
  });
});

describe("parseAssetClass", () => {
  it("accepts the 4 valid slugs", () => {
    expect(parseAssetClass("equity")).toBe("equity");
    expect(parseAssetClass("commodity")).toBe("commodity");
    expect(parseAssetClass("fixed-income")).toBe("fixed-income");
    expect(parseAssetClass("fx")).toBe("fx");
  });

  it("rejects invalid input", () => {
    expect(parseAssetClass("nonsense")).toBeNull();
    expect(parseAssetClass(undefined)).toBeNull();
    expect(parseAssetClass(42)).toBeNull();
  });
});
