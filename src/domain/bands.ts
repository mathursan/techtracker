import type { Signal } from "./types";

/**
 * Single source of truth for the score → signal mapping.
 *
 * `compositeScore` rounds to 1 decimal place, so the upper edges (e.g. 7.9)
 * are exact — no instrument ever lands at 7.95 and surprises us.
 */
export const SIGNAL_SEVERITY: Record<Signal, number> = {
  "Strong Buy": 5,
  Buy: 4,
  Neutral: 3,
  Sell: 2,
  "Strong Sell": 1,
};

export function signalForScore(score: number): Signal {
  if (Number.isNaN(score)) {
    throw new Error("signalForScore: score is NaN");
  }
  const clamped = Math.max(0, Math.min(10, score));
  if (clamped >= 8.0) return "Strong Buy";
  if (clamped >= 6.5) return "Buy";
  if (clamped >= 5.0) return "Neutral";
  if (clamped >= 3.5) return "Sell";
  return "Strong Sell";
}
