import type { IndicatorId } from "@/domain/types";

// Display labels live in `src/lib/indicator-labels.ts` as the single
// source of truth (shared with the screener, modal radar, and score
// panel). Re-export here so callers can import label + description
// from one place.
export { INDICATOR_LABELS } from "@/lib/indicator-labels";

export const INDICATOR_DESCRIPTIONS: Record<IndicatorId, string> = {
  ma_trend: "SMA 20 / 50 / 200 position, golden cross, MA stack alignment.",
  macd: "Zero-line position, signal-line crossover, histogram direction.",
  adx_dmi: "Trend strength (ADX) × directional bias (DI+/DI−).",
  rsi: "Overbought / oversold zones + momentum direction.",
  sar: "Price vs parabolic SAR; distance-from-SAR as conviction.",
  bollinger: "%B band position + squeeze / expansion detection.",
  stochastic: "%K / %D zone crossovers; confirmation of extremes.",
  obv: "Volume confirms or diverges from price direction.",
  ichimoku: "Cloud position, Tenkan/Kijun cross, cloud-kind color.",
};
