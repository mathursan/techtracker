import { describe, it, expect } from "vitest";
import { signalForScore, SIGNAL_BANDS } from "./bands";

describe("signalForScore", () => {
  it.each([
    [10, "Strong Buy"],
    [8.0, "Strong Buy"],
    [7.9, "Buy"],
    [6.5, "Buy"],
    [6.4, "Neutral"],
    [5.0, "Neutral"],
    [4.9, "Sell"],
    [3.5, "Sell"],
    [3.4, "Strong Sell"],
    [0.0, "Strong Sell"],
  ] as const)("maps %s -> %s", (score, signal) => {
    expect(signalForScore(score)).toBe(signal);
  });

  it("clamps scores above 10", () => {
    expect(signalForScore(12.5)).toBe("Strong Buy");
  });

  it("clamps scores below 0", () => {
    expect(signalForScore(-1)).toBe("Strong Sell");
  });

  it("throws on NaN", () => {
    expect(() => signalForScore(NaN)).toThrow();
  });

  it("bands cover [0, 10] with no gaps", () => {
    const ranges = [...SIGNAL_BANDS].sort((a, b) => a.min - b.min);
    for (let i = 1; i < ranges.length; i++) {
      const gap = ranges[i].min - ranges[i - 1].max;
      expect(gap).toBeGreaterThan(0);
      expect(gap).toBeLessThanOrEqual(0.11);
    }
  });
});
