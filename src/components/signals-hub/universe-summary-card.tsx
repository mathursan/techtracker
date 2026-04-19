import Link from "next/link";

import type { UniverseCard } from "@/domain/signals-hub";
import { scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

export function UniverseSummaryCard({ card }: { card: UniverseCard }) {
  if (!card.hasData) {
    return (
      <div
        className="flex min-w-[11rem] flex-col gap-1 rounded-md border border-dashed bg-muted/20 px-3 py-2 text-xs text-muted-foreground"
        aria-label={`${card.displayName} — no data yet`}
      >
        <div className="font-medium">{card.displayName}</div>
        <div className="text-[10px] uppercase tracking-wide">
          No data yet
        </div>
      </div>
    );
  }

  return (
    <Link
      href={`/${card.universe}`}
      prefetch={false}
      className="flex min-w-[11rem] flex-col gap-1 rounded-md border bg-background px-3 py-2 transition-colors hover:bg-muted"
      aria-label={`${card.displayName} — ${card.totalCount} instruments, open screener`}
    >
      <div className="text-xs font-medium">{card.displayName}</div>
      <div className="flex items-baseline gap-3 text-xs">
        <span className="text-muted-foreground">avg</span>
        <span className={cn("font-mono font-semibold", scoreTextClass(card.avgScore))}>
          {card.avgScore.toFixed(1)}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
        <span className="text-emerald-600 dark:text-emerald-400">
          🟢 {card.strongBuyCount}
        </span>
        <span className="text-rose-600 dark:text-rose-400">
          🔴 {card.strongSellCount}
        </span>
        <span className="text-muted-foreground">{card.totalCount} total</span>
      </div>
    </Link>
  );
}
