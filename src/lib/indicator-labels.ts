import type { IndicatorId } from "@/domain/types";

/**
 * Display label for each indicator, used by screener headers, the detail
 * modal radar + score panel, and the methodology page. Single source of
 * truth so the strings can't drift across surfaces.
 */
export const INDICATOR_LABELS: Record<IndicatorId, string> = {
  ma_trend: "MA Trend",
  macd: "MACD",
  adx_dmi: "ADX/DMI",
  rsi: "RSI",
  sar: "SAR",
  bollinger: "Bollinger",
  stochastic: "Stochastic",
  obv: "OBV",
  ichimoku: "Ichimoku",
};
