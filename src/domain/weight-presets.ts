import { DEFAULT_WEIGHTS } from "./composite";
import type { IndicatorId, Weights } from "./types";
import { INDICATOR_IDS } from "./types";

export type BuiltInPresetId =
  | "default"
  | "momentum"
  | "trend"
  | "mean-reversion";

export type UserPresetId = `user-${string}`;

export type WeightPresetId = BuiltInPresetId | UserPresetId;

export interface BuiltInWeightPreset {
  id: BuiltInPresetId;
  name: string;
  tagline: string;
  weights: Weights;
}

export interface UserWeightPreset {
  id: UserPresetId;
  name: string;
  weights: Weights;
}

export const MAX_USER_PRESETS = 5;

const DEFAULT_PRESET: BuiltInWeightPreset = {
  id: "default",
  name: "Default",
  tagline: "Balanced across trend, momentum, and volatility.",
  weights: DEFAULT_WEIGHTS,
};

/**
 * Momentum Focus — tilts toward MACD / RSI / Stochastic which capture
 * directional thrust. Lagging averages (MA Trend, Ichimoku) lose weight.
 */
const MOMENTUM_PRESET: BuiltInWeightPreset = {
  id: "momentum",
  name: "Momentum Focus",
  tagline: "Leans on oscillators and rate-of-change indicators.",
  weights: {
    ma_trend: 10,
    macd: 20,
    adx_dmi: 12,
    rsi: 18,
    sar: 10,
    bollinger: 8,
    stochastic: 15,
    obv: 5,
    ichimoku: 2,
  },
};

/**
 * Trend Following — heavy on MA Trend, MACD, ADX/DMI, SAR, Ichimoku.
 * Mean-reversion indicators (Bollinger, Stochastic) are de-weighted.
 */
const TREND_PRESET: BuiltInWeightPreset = {
  id: "trend",
  name: "Trend Following",
  tagline: "Weights the classic trend stack heavier than oscillators.",
  weights: {
    ma_trend: 22,
    macd: 18,
    adx_dmi: 17,
    rsi: 6,
    sar: 14,
    bollinger: 5,
    stochastic: 5,
    obv: 5,
    ichimoku: 8,
  },
};

/**
 * Mean Reversion — favours Bollinger, Stochastic, RSI extremes; trend
 * indicators matter less.
 */
const MEAN_REVERSION_PRESET: BuiltInWeightPreset = {
  id: "mean-reversion",
  name: "Mean Reversion",
  tagline: "Weights overbought/oversold indicators heavier than trend.",
  weights: {
    ma_trend: 8,
    macd: 10,
    adx_dmi: 8,
    rsi: 18,
    sar: 8,
    bollinger: 18,
    stochastic: 18,
    obv: 8,
    ichimoku: 4,
  },
};

export const BUILT_IN_PRESETS: readonly BuiltInWeightPreset[] = [
  DEFAULT_PRESET,
  MOMENTUM_PRESET,
  TREND_PRESET,
  MEAN_REVERSION_PRESET,
] as const;

const BUILT_IN_BY_ID: ReadonlyMap<BuiltInPresetId, BuiltInWeightPreset> = new Map(
  BUILT_IN_PRESETS.map((p) => [p.id, p] as const),
);

export function builtInPresetById(id: BuiltInPresetId): BuiltInWeightPreset {
  const hit = BUILT_IN_BY_ID.get(id);
  if (!hit) throw new Error(`Unknown built-in preset: ${id}`);
  return hit;
}

const BUILT_IN_IDS = new Set<string>(BUILT_IN_PRESETS.map((p) => p.id));

export function isBuiltInPresetId(id: string): id is BuiltInPresetId {
  return BUILT_IN_IDS.has(id);
}

export function isUserPresetId(id: string): id is UserPresetId {
  return id.startsWith("user-");
}

/**
 * Redistribute weights so the total is exactly 100, preserving the user-
 * set value on `changed` and spreading the delta proportionally across
 * the remaining indicators. Result values are integers; any rounding
 * residual lands on the indicator with the largest post-redistribution
 * weight, so the sum is exactly 100 every time.
 */
export function normalizeSliderAdjustment(
  current: Weights,
  changed: IndicatorId,
  newValue: number,
): Weights {
  const clampedNew = Math.max(0, Math.min(100, Math.round(newValue)));
  const others: IndicatorId[] = INDICATOR_IDS.filter((id) => id !== changed);
  const otherTotal = others.reduce((s, id) => s + (current[id] ?? 0), 0);
  const budget = 100 - clampedNew;

  const next: Weights = { ...current, [changed]: clampedNew };

  if (otherTotal <= 0) {
    const share = others.length > 0 ? Math.floor(budget / others.length) : 0;
    for (const id of others) next[id] = share;
  } else {
    for (const id of others) {
      const raw = (current[id] / otherTotal) * budget;
      next[id] = Math.max(0, Math.round(raw));
    }
  }

  // Re-balance so integer sum is exactly 100; the indicator the user
  // dragged stays pinned.
  let total = INDICATOR_IDS.reduce((s, id) => s + next[id], 0);
  if (total !== 100) {
    const adjustableIds = others.slice().sort((a, b) => next[b] - next[a]);
    let i = 0;
    while (total !== 100 && i < adjustableIds.length * 2) {
      const id = adjustableIds[i % adjustableIds.length];
      const bump = total < 100 ? 1 : -1;
      const candidate = next[id] + bump;
      if (candidate >= 0 && candidate <= 100) {
        next[id] = candidate;
        total += bump;
      }
      i += 1;
    }
  }

  return next;
}
