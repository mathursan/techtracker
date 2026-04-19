import { Clock } from "lucide-react";

import { latestAsOf } from "@/lib/snapshots";
import type { Universe } from "@/domain/types";
import { TABS } from "@/lib/nav";

/**
 * Format as US Eastern time — the reference timezone for the scoring
 * pipeline (post-US-close snapshots). Literal "ET" suffix keeps output
 * stable across ICU versions where `timeZoneName: "short"` can emit
 * "EDT" / "EST" / "GMT-5".
 */
const ET_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
  timeZone: "America/New_York",
});

function formatAsOf(d: Date): string {
  return `${ET_FORMATTER.format(d)} ET`;
}

export async function StatusLine() {
  const universes: Universe[] = TABS
    .map((t) => t.universe)
    .filter((u): u is Universe => Boolean(u));

  const latest = await latestAsOf(universes);

  const label = latest
    ? `Last refreshed: ${formatAsOf(latest)}`
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
