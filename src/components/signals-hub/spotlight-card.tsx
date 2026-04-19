"use client";

import type { SpotlightVM } from "@/domain/signals-hub";
import { performanceTextClass, scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

import { SignalBadge } from "@/components/shared/signal-badge";

export function SpotlightCard({
  vm,
  onOpen,
}: {
  vm: SpotlightVM;
  onOpen: (vm: SpotlightVM) => void;
}) {
  const inst = vm.instrument;
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(vm)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(vm);
        }
      }}
      aria-label={`${inst.ticker} ${inst.name} — open detail`}
      className="flex cursor-pointer flex-col gap-2 rounded-lg border bg-background p-3 shadow-sm transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate font-semibold">{inst.ticker}</div>
          <div className="truncate text-xs text-muted-foreground">{inst.name}</div>
        </div>
        <div
          className={cn("font-mono text-lg font-semibold", scoreTextClass(inst.compositeScore))}
        >
          {inst.compositeScore.toFixed(1)}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <SignalBadge signal={inst.signal} />
        <span
          className={cn(
            "font-mono",
            performanceTextClass(inst.perfOneMonth),
          )}
        >
          {inst.perfOneMonth >= 0 ? "+" : ""}
          {inst.perfOneMonth.toFixed(2)}%
        </span>
        <span className="ml-auto rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">
          {vm.universeDisplayName}
        </span>
      </div>
    </div>
  );
}
