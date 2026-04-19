import type { UniverseSummary } from "@/domain/types";
import { scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

export function KpiCardRow({
  summary,
  filteredCount,
}: {
  summary: UniverseSummary;
  filteredCount: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 p-6 md:grid-cols-4">
      <KpiCard label="Avg Score" value={
        <span className={cn("text-3xl font-semibold", scoreTextClass(summary.avgScore))}>
          {summary.avgScore.toFixed(1)}
        </span>
      } />
      <KpiCard label="Strong Buy" value={
        <span className="text-3xl font-semibold text-emerald-600 dark:text-emerald-400">
          {summary.strongBuyCount}
        </span>
      } />
      <KpiCard label="Strong Sell" value={
        <span className="text-3xl font-semibold text-rose-600 dark:text-rose-400">
          {summary.strongSellCount}
        </span>
      } />
      <KpiCard label="Showing" value={
        <span className="text-3xl font-semibold">
          {filteredCount} <span className="text-base text-muted-foreground">/ {summary.totalCount}</span>
        </span>
      } />
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </div>
      <div className="mt-1">{value}</div>
    </div>
  );
}
