import { Clock } from "lucide-react";

import type { TabDef } from "@/lib/nav";

/**
 * Trader-facing empty state. No dev-only copy here (no python commands, no
 * internal file paths) — users open this page and should understand it in
 * product terms. The roadmap/developer guidance lives in PlaceholderView.
 */
export function NoDataView({ tab }: { tab: TabDef }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/20 p-12">
      <div className="max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground"
        >
          <Clock className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">{tab.label}</h2>
        <p className="text-sm text-muted-foreground">
          No {tab.label} snapshot available yet. Data refreshes once per
          weekday after the close; check back later today.
        </p>
      </div>
    </main>
  );
}
