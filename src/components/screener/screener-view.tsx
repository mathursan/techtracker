import type { ScoreSnapshot } from "@/domain/types";
import {
  filterByChip,
  filterBySearch,
  normalizeSearch,
  resolveChipKey,
  summarizeFiltered,
} from "@/domain/filters";

import { ActivePresetBanner } from "@/components/shared/active-preset-banner";

import { ChipRow } from "./chip-row";
import { KpiCardRow } from "./kpi-card-row";
import { ScreenerTable } from "./screener-table";
import { SearchInput } from "./search-input";

export function ScreenerView({
  snapshot,
  chipKey,
  search,
}: {
  snapshot: ScoreSnapshot;
  chipKey?: string;
  search?: string;
}) {
  const resolvedKey = resolveChipKey(chipKey, snapshot.summary.filters);
  const normalizedQuery = normalizeSearch(search);

  const byChip = filterByChip(snapshot.instruments, resolvedKey);
  const filtered = filterBySearch(byChip, normalizedQuery);
  const summary = summarizeFiltered(snapshot.summary, filtered);

  return (
    <main className="flex-1">
      <ActivePresetBanner />
      <ChipRow filters={snapshot.summary.filters} />
      {/* Keying SearchInput by universe + chip re-mounts it on navigation
          changes from outside (tab switch, back/forward), sidestepping the
          URL→local sync problem while keeping typing snappy. */}
      <SearchInput key={`${snapshot.universe}:${resolvedKey}`} />
      <KpiCardRow summary={summary} filteredCount={filtered.length} />
      <ScreenerTable instruments={filtered} />
    </main>
  );
}
