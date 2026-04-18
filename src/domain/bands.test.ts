import { describe, it, expect } from "vitest";
import { signalForScore } from "./bands";

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
});
