import type { Universe } from "@/domain/types";
import { TABS } from "./nav";

/**
 * Universe → display label, derived once from `TABS` so the portfolio /
 * screener / candidate-table columns can't drift from the tab strip.
 * Keyed by the `Universe` union for type-narrowed access; value is the
 * `TabDef.label` string.
 *
 * Universes without a corresponding tab (e.g. `portfolio-etfs` is in the
 * `Universe` type but not yet wired as a tab) return `undefined`;
 * callers fall back to the raw slug.
 */
export const UNIVERSE_LABELS: Partial<Record<Universe, string>> = Object.fromEntries(
  TABS.filter((t) => t.universe).map((t) => [t.universe as Universe, t.label]),
) as Partial<Record<Universe, string>>;

export function labelForUniverse(universe: Universe): string {
  return UNIVERSE_LABELS[universe] ?? universe;
}
