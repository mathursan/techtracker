import type { ScoreSnapshot } from "@/domain/types";

import { KpiCardRow } from "./kpi-card-row";
import { ScreenerTable } from "./screener-table";

export function ScreenerView({ snapshot }: { snapshot: ScoreSnapshot }) {
  return (
    <main className="flex-1">
      <KpiCardRow summary={snapshot.summary} filteredCount={snapshot.instruments.length} />
      <ScreenerTable instruments={snapshot.instruments} />
    </main>
  );
}
