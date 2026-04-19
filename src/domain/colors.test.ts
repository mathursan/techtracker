import { describe, it, expect } from "vitest";

import {
  performanceTextClass,
  scoreTextClass,
  signalBadgeClass,
  toneForScore,
} from "./colors";

describe("toneForScore", () => {
  it.each([
    [10, "green"],
    [7.0, "green"],
    [6.9, "amber"],
    [4.0, "amber"],
    [3.9, "red"],
    [0, "red"],
  ] as const)("maps %s → %s", (score, expected) => {
    expect(toneForScore(score)).toBe(expected);
  });

  it("NaN → amber (neutral default)", () => {
    expect(toneForScore(Number.NaN)).toBe("amber");
  });
});

describe("scoreTextClass", () => {
  it("returns distinct classes per tone", () => {
    expect(scoreTextClass(8)).not.toBe(scoreTextClass(5));
    expect(scoreTextClass(5)).not.toBe(scoreTextClass(2));
  });
});

describe("signalBadgeClass", () => {
  it("returns a distinct class per signal", () => {
    const classes = new Set(
      (["Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"] as const).map(
        signalBadgeClass,
      ),
    );
    expect(classes.size).toBe(5);
  });
});

describe("performanceTextClass", () => {
  it("positive → emerald, negative → rose, zero → muted", () => {
    expect(performanceTextClass(0.01)).toContain("emerald");
    expect(performanceTextClass(-0.01)).toContain("rose");
    expect(performanceTextClass(0)).toContain("muted");
  });
});
