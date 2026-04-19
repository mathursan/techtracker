import type { Instrument, UniverseSummary } from "./types";

export const ALL_CHIP_KEY = "all";

/**
 * Pure filter: returns the subset of `instruments` that match the given
 * chip key. `all` (or any empty / unknown key) returns the full list.
 */
export function filterByChip(
  instruments: readonly Instrument[],
  chipKey: string | undefined,
): Instrument[] {
  if (!chipKey || chipKey === ALL_CHIP_KEY) return [...instruments];
  return instruments.filter((i) => i.tags?.includes(chipKey) ?? false);
}

/** Recompute a summary against a filtered instrument list. `totalCount`
 * always reflects the full universe so "Showing N / M" is honest. */
export function summarizeFiltered(
  base: UniverseSummary,
  filtered: readonly Instrument[],
): UniverseSummary {
  if (filtered.length === 0) {
    return {
      ...base,
      avgScore: 0,
      strongBuyCount: 0,
      strongSellCount: 0,
    };
  }
  const avg =
    filtered.reduce((sum, i) => sum + i.compositeScore, 0) / filtered.length;
  return {
    ...base,
    avgScore: Math.round(avg * 100) / 100,
    strongBuyCount: filtered.filter((i) => i.signal === "Strong Buy").length,
    strongSellCount: filtered.filter((i) => i.signal === "Strong Sell").length,
  };
}

/** Safely resolve a chip key from a URL param against the allowed filters. */
export function resolveChipKey(
  raw: string | null | undefined,
  filters: readonly { key: string; label: string }[],
): string {
  if (!raw) return ALL_CHIP_KEY;
  return filters.some((f) => f.key === raw) ? raw : ALL_CHIP_KEY;
}
