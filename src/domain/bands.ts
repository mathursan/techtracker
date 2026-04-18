import type { Signal } from "./types";

export const SIGNAL_BANDS = [
  { min: 8.0, max: 10.0, signal: "Strong Buy" as const },
  { min: 6.5, max: 7.9, signal: "Buy" as const },
  { min: 5.0, max: 6.4, signal: "Neutral" as const },
  { min: 3.5, max: 4.9, signal: "Sell" as const },
  { min: 0.0, max: 3.4, signal: "Strong Sell" as const },
] as const;

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
