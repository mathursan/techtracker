export type Universe =
  | "stocks"
  | "sector-etfs"
  | "industry-etfs"
  | "country-etfs"
  | "currencies"
  | "commodities"
  | "india"
  | "hong-kong"
  | "singapore"
  | "japan"
  | "europe"
  | "fixed-income"
  | "broad-market"
  | "growth-value"
  | "portfolio-etfs";

export type Signal = "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell";

export type IndicatorId =
  | "ma_trend"
  | "macd"
  | "adx_dmi"
  | "rsi"
  | "sar"
  | "bollinger"
  | "stochastic"
  | "obv"
  | "ichimoku";

export interface IndicatorDef {
  id: IndicatorId;
  displayName: string;
  description: string;
  defaultWeight: number;
}

export interface IndicatorScore {
  id: IndicatorId;
  value: number;
}

export interface Instrument {
  ticker: string;
  name: string;
  universe: Universe;
  sector?: string;
  country?: string;
  aum?: string;
  ter?: number;
  price: number;
  perfOneMonth: number;
  perfThreeMonth: number;
  perfOneYear?: number;
  sparkline: number[];
  indicators: IndicatorScore[];
  compositeScore: number;
  signal: Signal;
  previousSignal?: Signal;
  asOf: string;
}

export interface UniverseSummary {
  universe: Universe;
  displayName: string;
  totalCount: number;
  avgScore: number;
  strongBuyCount: number;
  strongSellCount: number;
  upgrades?: number;
  downgrades?: number;
  filters: { key: string; label: string }[];
}

export type WeightPresetId =
  | "default"
  | "momentum"
  | "trend-following"
  | "mean-reversion"
  | `user-${string}`;

export type Weights = Record<IndicatorId, number>;

export interface WeightPreset {
  id: WeightPresetId;
  name: string;
  weights: Weights;
  isUserSaved?: boolean;
}

export interface ScoreSnapshot {
  asOf: string;
  universe: Universe;
  instruments: Instrument[];
  summary: UniverseSummary;
  placeholder?: boolean;
}

/**
 * Canonical indicator order — matches the weight table in the Methodology tab
 * (see docs/replicate/analysis/uc-11-methodology-weights.md). Any UI that
 * iterates indicators MUST use this order so the rendering matches the
 * published methodology.
 */
export const INDICATOR_IDS: readonly IndicatorId[] = [
  "ma_trend",
  "macd",
  "adx_dmi",
  "rsi",
  "sar",
  "bollinger",
  "stochastic",
  "obv",
  "ichimoku",
] as const;
