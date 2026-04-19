/**
 * Macro-regime preset portfolios for the Portfolio Builder (UC-08).
 *
 * Each preset is a curated holdings list. Tickers are resolved at render
 * time against whatever universe snapshots exist — presets don't declare
 * the universe, so rotating a ticker between universes (e.g. an ETF moving
 * from `sector-etfs` to `broad-market`) doesn't require editing this file.
 *
 * Weights: omitting `weight` on a holding means "equal-weight with the
 * other holdings in this preset". The builder re-normalises to sum to 100%.
 * Presets that prescribe explicit weights are free to mix both — any
 * holding with `weight` set is honored; un-weighted holdings split the
 * remainder equally.
 */

export type PresetSlug =
  | "late-cycle"
  | "stagflation"
  | "risk-off"
  | "reflation";

export interface PresetHolding {
  ticker: string;
  weight?: number;
}

export interface PortfolioPreset {
  slug: PresetSlug;
  emoji: string;
  name: string;
  thesis: string;
  holdings: PresetHolding[];
}

export const PORTFOLIO_PRESETS: readonly PortfolioPreset[] = [
  {
    slug: "late-cycle",
    emoji: "🔄",
    name: "Late Cycle Expansion",
    thesis: "Quality equity, short duration, gold",
    holdings: [
      { ticker: "AAPL" },
      { ticker: "MSFT" },
      { ticker: "XLK" },
      { ticker: "XLV" },
      { ticker: "XLU" },
      { ticker: "KO" },
      { ticker: "GC=F" },
    ],
  },
  {
    slug: "stagflation",
    emoji: "🔥",
    name: "Stagflation Hedge",
    thesis: "Hard assets, commodities, inflation protection",
    holdings: [
      { ticker: "GC=F" },
      { ticker: "SI=F" },
      { ticker: "CL=F" },
      { ticker: "HG=F" },
      { ticker: "XLE" },
      { ticker: "ZC=F" },
    ],
  },
  {
    slug: "risk-off",
    emoji: "🛡️",
    name: "Risk-Off / Recession",
    thesis: "Max quality bonds, gold, min-vol equity",
    holdings: [
      { ticker: "GC=F" },
      { ticker: "XLP" },
      { ticker: "XLU" },
      { ticker: "XLV" },
      { ticker: "KO" },
    ],
  },
  {
    slug: "reflation",
    emoji: "🚀",
    name: "Reflation / Commodity Bull",
    thesis: "Recovery + inflation — broad equity, EM, commodities",
    holdings: [
      { ticker: "XLF" },
      { ticker: "XLI" },
      { ticker: "XLY" },
      { ticker: "RELIANCE.NS" },
      { ticker: "SI=F" },
      { ticker: "HG=F" },
    ],
  },
] as const;

const SLUGS = new Set<string>(PORTFOLIO_PRESETS.map((p) => p.slug));

export function parsePresetSlug(raw: unknown): PresetSlug | null {
  if (typeof raw !== "string") return null;
  return SLUGS.has(raw) ? (raw as PresetSlug) : null;
}

export function presetBySlug(slug: PresetSlug): PortfolioPreset {
  const p = PORTFOLIO_PRESETS.find((p) => p.slug === slug);
  if (!p) throw new Error(`Unknown preset slug: ${slug}`);
  return p;
}
