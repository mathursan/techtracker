import type { Instrument, Signal } from "./types";

/** Canonical order for signal-distribution x-axis (worst → best). */
export const SIGNAL_ORDER: readonly Signal[] = [
  "Strong Sell",
  "Sell",
  "Neutral",
  "Buy",
  "Strong Buy",
];

export interface SignalBucket {
  signal: Signal;
  count: number;
}

export interface SectorAverage {
  /** Chip key (e.g. `"tech"`). */
  key: string;
  /** Chip label (e.g. `"Information Technology"`). */
  label: string;
  avgScore: number;
  instrumentCount: number;
}

export interface ScoreBucket {
  /** 0 .. 9 — lower bound of the bucket (0-1, 1-2, …, 9-10). */
  index: number;
  label: string;
  /** Bucket range is `[index, index+1)` except the last which is `[9, 10]`. */
  count: number;
}

export interface AnalyticsVM {
  universeLabel: string;
  asOf: string;
  totalCount: number;
  signalDistribution: SignalBucket[];
  sectorAverages: SectorAverage[];
  scoreHistogram: ScoreBucket[];
}

export function histogramBucketIndex(score: number): number {
  // Clamp to [0, 10] then floor. The last bucket (9-10) is closed on the
  // right, so a score of exactly 10 lands in bucket 9, not bucket 10.
  // NaN throws (matches `signalForScore` contract — we never score a NaN).
  if (Number.isNaN(score)) {
    throw new Error("histogramBucketIndex: score is NaN");
  }
  if (score >= 10) return 9;
  if (score <= 0) return 0;
  return Math.min(9, Math.max(0, Math.floor(score)));
}

function emptyHistogram(): ScoreBucket[] {
  return Array.from({ length: 10 }, (_, i) => ({
    index: i,
    label: `${i}-${i + 1}`,
    count: 0,
  }));
}

/**
 * Build the analytics view model for a universe snapshot.
 *
 * Sector attribution uses the `tags[]` on each instrument — the chip keys
 * from UC-02 (`tech`, `energy`, `cons-staples`, etc.). Labels come from
 * the passed-in `filters` array so the display text stays in sync with
 * the chip row. Instruments tagged `all` or with no tags don't
 * contribute to sector averages.
 */
export function aggregateAnalytics(input: {
  universeLabel: string;
  asOf: string;
  instruments: readonly Instrument[];
  filters: ReadonlyArray<{ key: string; label: string }>;
}): AnalyticsVM {
  const { instruments, filters } = input;

  // Signal distribution — preserve canonical order even for zero counts.
  const signalCounts: Record<Signal, number> = {
    "Strong Sell": 0,
    Sell: 0,
    Neutral: 0,
    Buy: 0,
    "Strong Buy": 0,
  };
  for (const inst of instruments) signalCounts[inst.signal] += 1;
  const signalDistribution: SignalBucket[] = SIGNAL_ORDER.map((signal) => ({
    signal,
    count: signalCounts[signal],
  }));

  // Sector averages — key by chip key; only surface keys that have ≥1
  // instrument in the snapshot AND a matching filter label.
  const sectorAccum = new Map<string, { sum: number; n: number }>();
  for (const inst of instruments) {
    const tags = inst.tags ?? [];
    for (const t of tags) {
      if (t === "all") continue;
      const slot = sectorAccum.get(t) ?? { sum: 0, n: 0 };
      slot.sum += inst.compositeScore;
      slot.n += 1;
      sectorAccum.set(t, slot);
    }
  }
  const labelByKey = new Map(filters.map((f) => [f.key, f.label] as const));
  const sectorAverages: SectorAverage[] = [...sectorAccum.entries()]
    .filter(([key]) => labelByKey.has(key))
    .map(([key, { sum, n }]) => ({
      key,
      label: labelByKey.get(key) ?? key,
      avgScore: Math.round((sum / n) * 10) / 10,
      instrumentCount: n,
    }))
    .sort((a, b) => b.avgScore - a.avgScore);

  // Score histogram — 10 buckets.
  const scoreHistogram = emptyHistogram();
  for (const inst of instruments) {
    scoreHistogram[histogramBucketIndex(inst.compositeScore)].count += 1;
  }

  return {
    universeLabel: input.universeLabel,
    asOf: input.asOf,
    totalCount: instruments.length,
    signalDistribution,
    sectorAverages,
    scoreHistogram,
  };
}

