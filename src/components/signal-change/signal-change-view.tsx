import type { SignalChangeVM } from "@/domain/signal-change";
import { LOOKBACK_LABELS } from "@/domain/signal-change";

import { ChangeTable } from "./change-table";
import { DirectionTabs } from "./direction-tabs";
import { LookbackToggle } from "./lookback-toggle";
import { UniverseChangeStrip } from "./universe-change-strip";

export function SignalChangeView({ vm }: { vm: SignalChangeVM }) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="flex flex-col gap-3 border-b px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Signal Change</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            What moved between {LOOKBACK_LABELS[vm.lookback].toLowerCase()} ago and now ·{" "}
            <span className="text-emerald-600 dark:text-emerald-400">
              ⬆ {vm.allMarkets.upgrades}
            </span>{" "}
            ·{" "}
            <span className="text-rose-600 dark:text-rose-400">
              ⬇ {vm.allMarkets.downgrades}
            </span>
          </p>
        </div>
        <LookbackToggle active={vm.lookback} />
      </header>

      {vm.noHistory ? (
        <div className="m-6 grid place-items-center rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          <div className="max-w-md">
            <div className="font-medium text-foreground">
              Awaiting historical snapshots
            </div>
            <p className="mt-1 text-xs">
              The scoring pipeline (UC-15) emits a rolling archive under{" "}
              <code className="font-mono">public/data/history/</code>. Once at least
              one universe has a {LOOKBACK_LABELS[vm.lookback].toLowerCase()}-old
              snapshot, signal changes will appear here.
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
            <ChangeTable rows={vm.rows} />
          </div>
        </>
      )}
    </div>
  );
}
