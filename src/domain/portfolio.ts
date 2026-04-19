import type { Instrument, ScoreSnapshot } from "./types";
import type { PortfolioPreset } from "./portfolio-presets";

export interface PortfolioHoldingVM {
  ticker: string;
  /** Final weight this holding contributes, 0–100. */
  weight: number;
  /** Resolved instrument if any snapshot published this ticker. Null = unresolved. */
  instrument: Instrument | null;
}

export interface PortfolioVM {
  preset: PortfolioPreset;
  holdings: PortfolioHoldingVM[];
  /** Count of holdings successfully resolved against a published snapshot. */
  resolvedCount: number;
  /** Count of holdings that couldn't be resolved. */
  unresolvedCount: number;
  /** Weighted mean of resolved holdings' compositeScore, normalised by the
   * weight mass that was actually resolved. Null when nothing resolves. */
  score: number | null;
  /** Sum of the resolved holdings' rendered weight (≤ 100). */
  resolvedWeightTotal: number;
}

/** First-match search across published snapshots. Deterministic on input order. */
export function findInstrumentByTicker(
  ticker: string,
  snapshots: ReadonlyArray<ScoreSnapshot | null>,
): Instrument | null {
  for (const snap of snapshots) {
    if (!snap) continue;
    const hit = snap.instruments.find((i) => i.ticker === ticker);
    if (hit) return hit;
  }
  return null;
}

/**
 * Build the Portfolio Builder view model for a preset.
 *
 * Weight rule: holdings with explicit `weight` are honored verbatim.
 * Holdings without `weight` split the REMAINING weight (100 minus the sum of
 * explicit weights) equally. If all holdings omit `weight`, each gets
 * `100 / N`. Weights are rounded to 2 dp on the rendered view model.
 *
 * Score rule: weighted mean across RESOLVED holdings only, re-normalised to
 * their weight mass so the score is comparable across presets that have some
 * unresolved tickers.
 */
export function buildPortfolioVM(
  preset: PortfolioPreset,
  snapshots: ReadonlyArray<ScoreSnapshot | null>,
): PortfolioVM {
  const explicitWeightSum = preset.holdings.reduce(
    (s, h) => s + (h.weight ?? 0),
    0,
  );
  const unweighted = preset.holdings.filter((h) => h.weight === undefined);
  const remainingWeight = Math.max(0, 100 - explicitWeightSum);
  const perUnweighted = unweighted.length > 0 ? remainingWeight / unweighted.length : 0;

  const holdings: PortfolioHoldingVM[] = preset.holdings.map((h) => {
    const weight = h.weight ?? perUnweighted;
    return {
      ticker: h.ticker,
      weight: Math.round(weight * 100) / 100,
      instrument: findInstrumentByTicker(h.ticker, snapshots),
    };
  });

  const resolvedCount = holdings.filter((h) => h.instrument !== null).length;
  const unresolvedCount = holdings.length - resolvedCount;
  const resolvedWeightTotal = holdings.reduce(
    (s, h) => (h.instrument !== null ? s + h.weight : s),
    0,
  );

  let score: number | null = null;
  if (resolvedWeightTotal > 0) {
    const weighted = holdings.reduce((s, h) => {
      if (!h.instrument) return s;
      return s + h.weight * h.instrument.compositeScore;
    }, 0);
    score = Math.round((weighted / resolvedWeightTotal) * 10) / 10;
  }

  return {
    preset,
    holdings,
    resolvedCount,
    unresolvedCount,
    score,
    resolvedWeightTotal: Math.round(resolvedWeightTotal * 100) / 100,
  };
}
