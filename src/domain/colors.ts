import type { Signal } from "./types";

/**
 * Single source of truth for domain-driven color classes.
 *
 * Score-to-color mapping follows the same bands as `signalForScore` but
 * maps to Tailwind tokens, so changing either side doesn't drift the other.
 * Callers ALWAYS go through these helpers — never hand-roll a band check.
 */

export type ColorTone = "green" | "amber" | "red";

export function toneForScore(score: number): ColorTone {
  if (Number.isNaN(score)) return "amber";
  if (score >= 7.0) return "green";
  if (score >= 4.0) return "amber";
  return "red";
}

const TONE_TEXT: Record<ColorTone, string> = {
  green: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  red: "text-rose-600 dark:text-rose-400",
};

export function scoreTextClass(score: number): string {
  return TONE_TEXT[toneForScore(score)];
}

const SIGNAL_STYLES: Record<Signal, string> = {
  "Strong Buy":
    "bg-emerald-600 text-white dark:bg-emerald-500",
  Buy: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  Neutral:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  Sell: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300",
  "Strong Sell": "bg-rose-600 text-white dark:bg-rose-500",
};

export function signalBadgeClass(signal: Signal): string {
  return SIGNAL_STYLES[signal];
}

export function performanceTextClass(pct: number): string {
  if (pct > 0) return "text-emerald-600 dark:text-emerald-400";
  if (pct < 0) return "text-rose-600 dark:text-rose-400";
  return "text-muted-foreground";
}

/**
 * Explicit hex colors per tone for use inside SVG `fill` / `stroke` where
 * Tailwind utility classes don't pipe through. Keep the brand palette
 * here so every chart (radar, sector average, histogram, etc.) renders
 * with identical shades.
 */
export const TONE_HEX: Record<ColorTone, string> = {
  green: "#10b981", // emerald-500
  amber: "#f59e0b", // amber-500
  red: "#f43f5e",   // rose-500
};
