"use client";

import { useState } from "react";

import type { SignalChangeRow } from "@/domain/signal-change";
import type { Instrument } from "@/domain/types";
import { performanceTextClass, scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

import { SignalBadge } from "@/components/screener/signal-badge";
import { TickerDetailModal } from "@/components/detail/ticker-detail-modal";

export function ChangeTable({ rows }: { rows: SignalChangeRow[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Instrument | null>(null);

  const onOpen = (inst: Instrument) => {
    setActive(inst);
    setOpen(true);
  };

  if (rows.length === 0) {
    return (
      <div className="grid h-40 place-items-center rounded border border-dashed text-sm text-muted-foreground">
        No signal changes in the selected window.
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto border-t">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-2 py-2 text-left">Ticker</th>
              <th scope="col" className="px-2 py-2 text-left">Name</th>
              <th scope="col" className="px-2 py-2 text-left">Universe</th>
              <th scope="col" className="px-2 py-2 text-left">Prev → Now</th>
              <th scope="col" className="px-2 py-2 text-right">Score</th>
              <th scope="col" className="px-2 py-2 text-right">1M %</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const direction = row.severityJump > 0 ? "up" : "down";
              return (
                <tr
                  key={`${row.universe}:${row.instrument.ticker}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onOpen(row.instrument)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onOpen(row.instrument);
                    }
                  }}
                  aria-label={`${row.instrument.ticker} ${row.previous} to ${row.instrument.signal} — open detail`}
                  className="cursor-pointer border-b transition-colors hover:bg-muted/40 focus-within:bg-muted/40"
                >
                  <td className="px-2 py-2 font-semibold">{row.instrument.ticker}</td>
                  <td className="px-2 py-2">
                    <span className="line-clamp-1 text-xs text-muted-foreground">
                      {row.instrument.name}
                    </span>
                  </td>
                  <td className="px-2 py-2 text-xs">{row.universeDisplayName}</td>
                  <td className="px-2 py-2">
                    <span className="flex flex-wrap items-center gap-1">
                      <SignalBadge signal={row.previous} />
                      <span
                        aria-hidden="true"
                        className={cn(
                          "inline-block font-mono text-xs",
                          direction === "up"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-rose-600 dark:text-rose-400",
                        )}
                      >
                        {direction === "up" ? "→ ⬆" : "→ ⬇"}
                      </span>
                      <SignalBadge signal={row.instrument.signal} />
                    </span>
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2 text-right font-mono font-semibold",
                      scoreTextClass(row.instrument.compositeScore),
                    )}
                  >
                    {row.instrument.compositeScore.toFixed(1)}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2 text-right font-mono",
                      performanceTextClass(row.instrument.perfOneMonth),
                    )}
                  >
                    {row.instrument.perfOneMonth >= 0 ? "+" : ""}
                    {row.instrument.perfOneMonth.toFixed(2)}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TickerDetailModal
        instrument={active}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
