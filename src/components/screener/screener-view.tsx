import type { ScoreSnapshot } from "@/domain/types";
import {
  filterByChip,
  resolveChipKey,
  summarizeFiltered,
} from "@/domain/filters";

import { ChipRow } from "./chip-row";
import { KpiCardRow } from "./kpi-card-row";
import { ScreenerTable } from "./screener-table";

export function ScreenerView({
  snapshot,
  chipKey,
}: {
  snapshot: ScoreSnapshot;
  chipKey?: string;
}) {
  const resolvedKey = resolveChipKey(chipKey, snapshot.summary.filters);
  const filtered = filterByChip(snapshot.instruments, resolvedKey);
  const summary = summarizeFiltered(snapshot.summary, filtered);

  return (
    <main className="flex-1">
      <ChipRow filters={snapshot.summary.filters} />
      <KpiCardRow summary={summary} filteredCount={filtered.length} />
      <ScreenerTable instruments={filtered} />
    </main>
  );
}
