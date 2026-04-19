import { Clock } from "lucide-react";

import { loadSnapshot } from "@/lib/snapshots";
import type { Universe } from "@/domain/types";
import { TABS } from "@/lib/nav";

function formatAsOf(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

/**
 * Finds the newest snapshot `asOf` across every screener universe and
 * renders it. Tool tabs have no universe of their own so we show the same
 * "latest across all universes" timestamp — that's what a trader wants.
 *
 * Rendered from a server component; the `loadSnapshot` call reads the
 * committed public/data tree at request time. No client data fetching.
 */
export async function StatusLine() {
  const universes: Universe[] = TABS
    .map((t) => t.universe)
    .filter((u): u is Universe => Boolean(u));

  const snapshots = await Promise.all(universes.map((u) => loadSnapshot(u)));
  const asOfs = snapshots
    .map((s) => s?.asOf)
    .filter((v): v is string => typeof v === "string");

  const latest = asOfs
    .map((iso) => new Date(iso))
    .filter((d) => !Number.isNaN(d.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const label = latest
    ? `Last refreshed: ${formatAsOf(latest.toISOString())}`
    : "No snapshot available yet — data refreshes weekday after close.";

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 border-b bg-muted/40 px-6 py-2 text-xs text-muted-foreground"
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}
