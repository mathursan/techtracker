import type { IndicatorId } from "@/domain/types";

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
