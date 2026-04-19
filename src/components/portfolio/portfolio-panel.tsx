import type { PortfolioVM } from "@/domain/portfolio";
import { scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

import { HoldingsTable } from "./holdings-table";

export function PortfolioPanel({ vm }: { vm: PortfolioVM }) {
  const { preset, score, holdings, resolvedCount, unresolvedCount, resolvedWeightTotal } = vm;

  return (
    <section aria-label="Active portfolio" className="flex flex-col">
      <div className="flex flex-wrap items-baseline gap-6 px-6 py-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Score
          </div>
          <div
            className={cn(
              "font-mono text-3xl font-semibold",
              score !== null ? scoreTextClass(score) : "text-muted-foreground",
            )}
          >
            {score !== null ? score.toFixed(1) : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Weight
          </div>
          <div className="font-mono text-lg">
            {resolvedWeightTotal.toFixed(0)}%
          </div>
          {unresolvedCount > 0 && (
            <div className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {unresolvedCount} unresolved excluded
            </div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Holdings ({preset.holdings.length})
          </div>
          <div className="font-mono text-lg">
            {resolvedCount} / {preset.holdings.length}{" "}
            <span className="text-xs text-muted-foreground">resolved</span>
          </div>
        </div>
        <div className="ml-auto max-w-md text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            <span aria-hidden="true">{preset.emoji} </span>
            {preset.name}
          </span>{" "}
          — {preset.thesis}
        </div>
      </div>
      <HoldingsTable holdings={holdings} />
    </section>
  );
}
