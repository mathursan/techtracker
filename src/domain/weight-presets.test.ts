import { describe, expect, it } from "vitest";

import { DEFAULT_WEIGHTS } from "./composite";
import type { IndicatorId, Weights } from "./types";
import { INDICATOR_IDS } from "./types";
import {
  BUILT_IN_PRESETS,
  builtInPresetById,
  isBuiltInPresetId,
  isUserPresetId,
  normalizeSliderAdjustment,
} from "./weight-presets";

function sum(w: Weights): number {
  return INDICATOR_IDS.reduce((s, id) => s + w[id], 0);
}

describe("built-in presets", () => {
  it("ships the 4 canonical presets", () => {
    expect(BUILT_IN_PRESETS.map((p) => p.id)).toEqual([
      "default",
      "momentum",
      "trend",
      "mean-reversion",
    ]);
  });

  it("every preset's weights sum to exactly 100", () => {
    for (const p of BUILT_IN_PRESETS) {
      expect(sum(p.weights)).toBe(100);
    }
  });

  it("every preset has a weight for every indicator", () => {
    for (const p of BUILT_IN_PRESETS) {
      for (const id of INDICATOR_IDS) {
        expect(typeof p.weights[id]).toBe("number");
      }
    }
  });

  it("builtInPresetById round-trips", () => {
    expect(builtInPresetById("momentum").id).toBe("momentum");
    expect(() => builtInPresetById("ghost" as never)).toThrow();
  });

  it("Default preset mirrors DEFAULT_WEIGHTS exactly", () => {
    expect(builtInPresetById("default").weights).toEqual(DEFAULT_WEIGHTS);
  });
});

describe("preset-id guards", () => {
  it("isBuiltInPresetId is true for shipped ids only", () => {
    expect(isBuiltInPresetId("default")).toBe(true);
    expect(isBuiltInPresetId("momentum")).toBe(true);
    expect(isBuiltInPresetId("user-mine")).toBe(false);
    expect(isBuiltInPresetId("ghost")).toBe(false);
  });

  it("isUserPresetId matches the user- prefix", () => {
    expect(isUserPresetId("user-mine")).toBe(true);
    expect(isUserPresetId("user-")).toBe(true);
    expect(isUserPresetId("mine")).toBe(false);
  });
});

describe("normalizeSliderAdjustment", () => {
  const start: Weights = { ...DEFAULT_WEIGHTS };

  it("keeps the total at 100 when you pin one indicator higher", () => {
    const next = normalizeSliderAdjustment(start, "ma_trend", 30);
    expect(next.ma_trend).toBe(30);
    expect(sum(next)).toBe(100);
  });

  it("keeps the total at 100 when you pin one indicator lower", () => {
    const next = normalizeSliderAdjustment(start, "ma_trend", 5);
    expect(next.ma_trend).toBe(5);
    expect(sum(next)).toBe(100);
  });

  it("clamps above 100 and below 0", () => {
    const hi = normalizeSliderAdjustment(start, "ma_trend", 150);
    expect(hi.ma_trend).toBe(100);
    expect(sum(hi)).toBe(100);
    const lo = normalizeSliderAdjustment(start, "ma_trend", -50);
    expect(lo.ma_trend).toBe(0);
    expect(sum(lo)).toBe(100);
  });

  it("handles the edge case where all non-changed weights are zero", () => {
    const zeroed: Weights = INDICATOR_IDS.reduce((out, id) => {
      out[id] = 0;
      return out;
    }, {} as Weights);
    zeroed.ma_trend = 100;
    const next = normalizeSliderAdjustment(zeroed, "ma_trend", 40);
    expect(next.ma_trend).toBe(40);
    expect(sum(next)).toBe(100);
  });

  it("is idempotent for a 0-delta change on an in-sum weight", () => {
    const next = normalizeSliderAdjustment(start, "ma_trend", start.ma_trend);
    expect(sum(next)).toBe(100);
    // Every id still equals the original (modulo potential 1-off rounding
    // absorbed by the largest weight); allow ±1 tolerance on each.
    for (const id of INDICATOR_IDS) {
      const delta = Math.abs(next[id] - start[id]);
      expect(delta).toBeLessThanOrEqual(1);
    }
  });

  it("pinning a weight to 0 redistributes its share to the others", () => {
    const next = normalizeSliderAdjustment(start, "ichimoku", 0);
    expect(next.ichimoku).toBe(0);
    expect(sum(next)).toBe(100);
    // Others should be >= their original (absorbed the 5% that was ichimoku).
    const othersGained = (
      ["ma_trend", "macd", "adx_dmi", "rsi"] as IndicatorId[]
    ).every((id) => next[id] >= start[id]);
    expect(othersGained).toBe(true);
  });
});
