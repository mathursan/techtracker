import { describe, it, expect } from "vitest";
import {
  DEFAULT_WEIGHTS,
  compositeScore,
  normalizeWeights,
} from "./composite";
import type { IndicatorScore } from "./types";
import { INDICATOR_IDS } from "./types";

function flatIndicators(value: number): IndicatorScore[] {
  return INDICATOR_IDS.map((id) => ({ id, value }));
}

describe("DEFAULT_WEIGHTS", () => {
  it("sums to 100", () => {
    const sum = INDICATOR_IDS.reduce((s, id) => s + DEFAULT_WEIGHTS[id], 0);
    expect(sum).toBe(100);
  });
});

describe("normalizeWeights", () => {
  it("preserves proportions and sums to 100", () => {
    const input = { ...DEFAULT_WEIGHTS, ma_trend: 36 };
    const out = normalizeWeights(input);
    const sum = INDICATOR_IDS.reduce((s, id) => s + out[id], 0);
    expect(sum).toBeCloseTo(100);
    expect(out.ma_trend).toBeGreaterThan(out.macd);
  });

  it("throws on zero total", () => {
    const zeros = INDICATOR_IDS.reduce(
      (w, id) => ({ ...w, [id]: 0 }),
      {} as Record<string, number>,
    );
    expect(() => normalizeWeights(zeros as never)).toThrow();
  });
});

describe("compositeScore", () => {
  it("returns the single score when all indicators equal", () => {
    expect(compositeScore(flatIndicators(7.0))).toBe(7.0);
  });

  it("is robust to missing indicators (treats as 0)", () => {
    const subset = flatIndicators(8.0).slice(0, 5);
    const score = compositeScore(subset);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(8.0);
  });

  it("weights sum impacts result predictably", () => {
    const indicators = flatIndicators(5);
    indicators[0] = { id: "ma_trend", value: 10 };
    const base = compositeScore(indicators);
    const heavy = compositeScore(indicators, {
      ...DEFAULT_WEIGHTS,
      ma_trend: 90,
    });
    expect(heavy).toBeGreaterThan(base);
  });
});
