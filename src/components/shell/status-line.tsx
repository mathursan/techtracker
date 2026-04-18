import { Clock } from "lucide-react";

/**
 * Displays snapshot freshness. Placeholder copy for now — wired to snapshot
 * `asOf` in issue #8 (UC-13).
 */
export function StatusLine() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center gap-2 border-b bg-muted/40 px-6 py-2 text-xs text-muted-foreground"
    >
      <Clock className="h-3.5 w-3.5" aria-hidden="true" />
      <span>Last refreshed: — — — — (ships in UC-13)</span>
    </div>
  );
}
