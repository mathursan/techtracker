"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { UniverseChangeSummary } from "@/domain/signal-change";
import type { Universe } from "@/domain/types";
import { cn } from "@/lib/utils";

export function UniverseChangeCard({
  summary,
  active,
}: {
  summary: UniverseChangeSummary;
  active: boolean;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefFor = (universe: Universe | null) => {
    const next = new URLSearchParams(params.toString());
    if (universe === null) next.delete("u");
    else next.set("u", universe);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <Link
      href={hrefFor(active ? null : summary.universe)}
      scroll={false}
      aria-pressed={active}
      className={cn(
        "flex min-w-[10rem] flex-col gap-1 rounded-md border px-3 py-2 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : summary.hasData
          ? "border-border bg-background hover:bg-muted"
          : "border-dashed border-border bg-muted/20 text-muted-foreground",
      )}
    >
      <span className="font-medium">{summary.displayName}</span>
      {summary.hasData ? (
        <span className="flex items-baseline gap-3 font-mono">
          <span className="text-emerald-600 dark:text-emerald-400">
            <span aria-hidden="true">⬆</span> {summary.upgrades}
          </span>
          <span className="text-rose-600 dark:text-rose-400">
            <span aria-hidden="true">⬇</span> {summary.downgrades}
          </span>
        </span>
      ) : (
        <span className="text-[10px] uppercase tracking-wide">
          No history yet
        </span>
      )}
    </Link>
  );
}

export function AllMarketsCard({
  upgrades,
  downgrades,
  universesWithData,
  active,
}: {
  upgrades: number;
  downgrades: number;
  universesWithData: number;
  active: boolean;
}) {
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefClearScope = () => {
    const next = new URLSearchParams(params.toString());
    next.delete("u");
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <Link
      href={hrefClearScope()}
      scroll={false}
      aria-pressed={active}
      className={cn(
        "flex min-w-[10rem] flex-col gap-1 rounded-md border px-3 py-2 text-xs transition-colors",
        active
          ? "border-primary bg-primary/10 text-foreground"
          : "border-border bg-background hover:bg-muted",
      )}
    >
      <span className="font-semibold">All markets</span>
      <span className="flex items-baseline gap-3 font-mono">
        <span className="text-emerald-600 dark:text-emerald-400">
          <span aria-hidden="true">⬆</span> {upgrades}
        </span>
        <span className="text-rose-600 dark:text-rose-400">
          <span aria-hidden="true">⬇</span> {downgrades}
        </span>
      </span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
        {universesWithData} universe{universesWithData === 1 ? "" : "s"} with history
      </span>
    </Link>
  );
}
