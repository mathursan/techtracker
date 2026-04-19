import type { HeatmapRow } from "@/domain/signals-hub";
import { SIGNAL_BANDS } from "@/domain/signals-hub";
import type { Signal } from "@/domain/types";
import { cn } from "@/lib/utils";

const BAND_BG: Record<Signal, string> = {
  "Strong Buy": "bg-emerald-500",
  Buy: "bg-emerald-300 dark:bg-emerald-400",
  Neutral: "bg-slate-300 dark:bg-slate-500",
  Sell: "bg-rose-300 dark:bg-rose-400",
  "Strong Sell": "bg-rose-500",
};

/** Opacity classes for 0..8+ counts. Brighter cell = heavier concentration. */
const INTENSITY: string[] = [
  "opacity-0",
  "opacity-20",
  "opacity-30",
  "opacity-40",
  "opacity-50",
  "opacity-60",
  "opacity-70",
  "opacity-80",
  "opacity-90",
];

function intensityClass(count: number): string {
  if (count <= 0) return INTENSITY[0];
  const i = Math.min(count, INTENSITY.length - 1);
  return INTENSITY[i];
}

export function HeatmapGrid({ rows }: { rows: HeatmapRow[] }) {
  return (
    <div
      role="table"
      aria-label="Cross-universe signal distribution"
      className="overflow-x-auto rounded-lg border"
    >
      <div
        role="row"
        className="grid grid-cols-[minmax(10rem,1fr)_repeat(5,minmax(4rem,1fr))_4rem] border-b bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground"
      >
        <div role="columnheader" className="px-3 py-2 text-left">Universe</div>
        {SIGNAL_BANDS.map((band) => (
          <div key={band} role="columnheader" className="px-2 py-2 text-center">
            {band}
          </div>
        ))}
        <div role="columnheader" className="px-2 py-2 text-right">Total</div>
      </div>
      {rows.map((row) => (
        <div
          key={row.universe}
          role="row"
          className={cn(
            "grid grid-cols-[minmax(10rem,1fr)_repeat(5,minmax(4rem,1fr))_4rem] border-b last:border-b-0",
            !row.hasData && "opacity-60",
          )}
        >
          <div role="cell" className="px-3 py-2 text-xs">
            {row.displayName}
            {!row.hasData && (
              <span className="ml-2 text-[10px] uppercase tracking-wide text-muted-foreground">
                no data
              </span>
            )}
          </div>
          {SIGNAL_BANDS.map((band) => {
            const count = row.counts[band];
            return (
              <div
                key={band}
                role="cell"
                aria-label={`${row.displayName} ${band}: ${count}`}
                className="relative grid place-items-center px-2 py-2"
              >
                <span
                  aria-hidden="true"
                  className={cn("absolute inset-0", BAND_BG[band], intensityClass(count))}
                />
                <span
                  className={cn(
                    "relative font-mono text-xs",
                    count === 0 ? "text-muted-foreground" : "font-semibold text-foreground",
                  )}
                >
                  {count}
                </span>
              </div>
            );
          })}
          <div role="cell" className="px-2 py-2 text-right font-mono text-xs text-muted-foreground">
            {row.hasData ? row.total : "—"}
          </div>
        </div>
      ))}
    </div>
  );
}
