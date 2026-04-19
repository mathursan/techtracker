import type { Signal } from "@/domain/types";
import { signalBadgeClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

// Source of truth for the band ranges is `src/domain/bands.ts::signalForScore`.
// If you edit the thresholds there, update this list too — the UI and the
// scoring function share the same values by construction.
const BANDS: { range: string; signal: Signal }[] = [
  { range: "8.0 – 10.0", signal: "Strong Buy" },
  { range: "6.5 – 7.9", signal: "Buy" },
  { range: "5.0 – 6.4", signal: "Neutral" },
  { range: "3.5 – 4.9", signal: "Sell" },
  { range: "0.0 – 3.4", signal: "Strong Sell" },
];

export function BandsTable() {
  return (
    <section aria-label="Scoring bands" className="flex flex-col gap-2 border-b px-6 py-4">
      <h2 className="text-sm font-semibold">Scoring bands</h2>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-3 py-2 text-left">Score range</th>
              <th scope="col" className="px-3 py-2 text-left">Signal</th>
            </tr>
          </thead>
          <tbody>
            {BANDS.map((b) => (
              <tr key={b.signal} className="border-b last:border-b-0">
                <td className="px-3 py-2 font-mono">{b.range}</td>
                <td className="px-3 py-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                      signalBadgeClass(b.signal),
                    )}
                  >
                    {b.signal}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
