import type { IndicatorId, IndicatorScore, Weights } from "./types";
import { INDICATOR_IDS } from "./types";

export const DEFAULT_WEIGHTS: Weights = {
  ma_trend: 18,
  macd: 15,
  adx_dmi: 13,
  rsi: 12,
  sar: 10,
  bollinger: 10,
  stochastic: 10,
  obv: 7,
  ichimoku: 5,
};

export function normalizeWeights(weights: Weights): Weights {
  const total = INDICATOR_IDS.reduce((sum, id) => sum + (weights[id] ?? 0), 0);
  if (total <= 0) {
    throw new Error("normalizeWeights: total weight is zero");
  }
  return INDICATOR_IDS.reduce((out, id) => {
    out[id] = ((weights[id] ?? 0) / total) * 100;
    return out;
  }, {} as Weights);
}

export function compositeScore(
  indicators: IndicatorScore[],
  weights: Weights = DEFAULT_WEIGHTS,
): number {
  const byId = new Map<IndicatorId, number>(
    indicators.map((i) => [i.id, i.value] as const),
  );
  const normalized = normalizeWeights(weights);
  const weighted = INDICATOR_IDS.reduce((sum, id) => {
    const value = byId.get(id);
    if (value == null) return sum;
    return sum + (normalized[id] / 100) * value;
  }, 0);
  return Math.round(weighted * 10) / 10;
}
