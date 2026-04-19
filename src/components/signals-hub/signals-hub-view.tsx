import type { SignalsHubVM, SignalsHubView as ViewMode } from "@/domain/signals-hub";

import { HeatmapGrid } from "./heatmap-grid";
import { SpotlightGrid } from "./spotlight-grid";
import { UniverseSummaryStrip } from "./universe-summary-strip";
import { ViewModeTabs } from "./view-mode-tabs";

export function SignalsHubView({
  vm,
  view,
}: {
  vm: SignalsHubVM;
  view: ViewMode;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Signals Hub</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cross-universe digest · {vm.snapshotCount} universe
          {vm.snapshotCount === 1 ? "" : "s"} with data · {vm.totalInstruments} instruments aggregated
        </p>
      </header>

      <UniverseSummaryStrip cards={vm.universeCards} />
      <ViewModeTabs active={view} />

      <div className="flex-1 px-6 py-4">
        {vm.snapshotCount === 0 && view !== "heatmap" ? (
          <div className="grid h-40 place-items-center rounded border border-dashed text-sm text-muted-foreground">
            No snapshots published yet.
          </div>
        ) : (
          <>
            {view === "top-buys" && (
              <SpotlightGrid
                items={vm.topBuys}
                emptyCopy="No Strong Buy or Buy signals across published snapshots."
              />
            )}
            {view === "top-sells" && (
              <SpotlightGrid
                items={vm.topSells}
                emptyCopy="No Strong Sell or Sell signals across published snapshots."
              />
            )}
            {view === "momentum" && (
              <SpotlightGrid
                items={vm.momentum}
                emptyCopy="No 1M % performance data in published snapshots."
              />
            )}
            {view === "heatmap" && <HeatmapGrid rows={vm.heatmap} />}
          </>
        )}
      </div>
    </div>
  );
}
