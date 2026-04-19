import type { Universe } from "./types";

export type AssetClass = "equity" | "commodity" | "fixed-income" | "fx";

export const ASSET_CLASSES: readonly AssetClass[] = [
  "equity",
  "commodity",
  "fixed-income",
  "fx",
] as const;

export const ASSET_CLASS_LABELS: Record<AssetClass, string> = {
  equity: "Equity",
  commodity: "Commodity",
  "fixed-income": "Fixed Income",
  fx: "FX",
};

/**
 * Map each universe to a coarse asset class for the candidate filter chips.
 * Broad/industry/sector/country/growth-value ETFs fold into `equity` because
 * they're equity-backed; `portfolio-etfs` (the curated UCITS basket) is also
 * equity-dominated. Real-Assets from the source app folds into `commodity`
 * for MVP (our seed has gold/silver/oil/copper/corn in that bucket).
 */
const UNIVERSE_TO_ASSET_CLASS: Record<Universe, AssetClass> = {
  stocks: "equity",
  "sector-etfs": "equity",
  "industry-etfs": "equity",
  "country-etfs": "equity",
  "broad-market": "equity",
  "growth-value": "equity",
  "portfolio-etfs": "equity",
  india: "equity",
  "hong-kong": "equity",
  singapore: "equity",
  japan: "equity",
  europe: "equity",
  commodities: "commodity",
  "fixed-income": "fixed-income",
  currencies: "fx",
};

export function assetClassForUniverse(universe: Universe): AssetClass {
  return UNIVERSE_TO_ASSET_CLASS[universe];
}

export function parseAssetClass(raw: unknown): AssetClass | null {
  if (typeof raw !== "string") return null;
  return (ASSET_CLASSES as readonly string[]).includes(raw)
    ? (raw as AssetClass)
    : null;
}
