import type { SignalChangeVM } from "@/domain/signal-change";
import { LOOKBACK_LABELS } from "@/domain/signal-change";

import { ChangeTable } from "./change-table";
import { DirectionTabs } from "./direction-tabs";
import { LookbackToggle } from "./lookback-toggle";
import { UniverseChangeStrip } from "./universe-change-strip";

export function SignalChangeView({ vm }: { vm: SignalChangeVM }) {
  const scopedSummary = vm.universeScope
    ? vm.perUniverse.find((u) => u.universe === vm.universeScope) ?? null
    : null;
  const scopeLabel = scopedSummary?.displayName ?? null;

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-col gap-3 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Signal Change</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What moved between {LOOKBACK_LABELS[vm.lookback].toLowerCase()} ago and now
            {scopeLabel ? ` · ${scopeLabel}` : ""} ·{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              <span aria-hidden="true">⬆</span> {vm.scopedCounts.upgrades}
            </span>{" "}
            ·{" "}
            <span className="text-rose-600 dark:text-rose-400">
              <span aria-hidden="true">⬇</span> {vm.scopedCounts.downgrades}
            </span>
          </p>
        </div>
        <LookbackToggle active={vm.lookback} />
      </header>

      {vm.noHistory ? (
        <div className="m-6 grid place-items-center rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          <div className="max-w-md">
            <div className="font-medium text-foreground">
              No historical snapshots yet
            </div>
            <p className="mt-1 text-xs">
              Signal changes need a prior snapshot to diff against. The scoring
              pipeline will start populating this view once it publishes at least
              one {LOOKBACK_LABELS[vm.lookback].toLowerCase()}-old snapshot.
            </p>
          </div>
        </div>
      ) : (
        <>
          <UniverseChangeStrip
            summaries={vm.perUniverse}
            allMarkets={vm.allMarkets}
            scope={vm.universeScope}
          />
          <DirectionTabs active={vm.direction} />
          <div className="flex-1 px-6 py-4">
            {vm.scopedNoHistory ? (
              <div className="grid h-40 place-items-center rounded border border-dashed text-sm text-muted-foreground">
                No historical snapshot for {scopeLabel ?? "this universe"} yet.
              </div>
            ) : (
              <ChangeTable rows={vm.rows} />
            )}
          </div>
        </>
      )}
    </div>
  );
}
