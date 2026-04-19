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

/**
 * Normalise a raw search param to a trimmed lowercase string, or null when
 * empty / whitespace-only. `null` explicitly means "no filter"; downstream
 * callers can treat a returned empty-string as a match-everything sentinel.
 */
export function normalizeSearch(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

/** Pure search: matches ticker OR name (case-insensitive substring). */
export function filterBySearch(
  instruments: readonly Instrument[],
  query: string | null,
): Instrument[] {
  if (!query) return [...instruments];
  const needle = query.toLowerCase();
  return instruments.filter(
    (i) =>
      i.ticker.toLowerCase().includes(needle) ||
      i.name.toLowerCase().includes(needle),
  );
}
