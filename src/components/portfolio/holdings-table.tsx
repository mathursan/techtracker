"use client";

import { useState } from "react";

import type { PortfolioHoldingVM } from "@/domain/portfolio";
import type { Instrument } from "@/domain/types";
import { scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

import { SignalBadge } from "@/components/screener/signal-badge";
import { TickerDetailModal } from "@/components/detail/ticker-detail-modal";

const UNIVERSE_LABELS: Record<string, string> = {
  stocks: "Stocks",
  "sector-etfs": "Sector ETF",
  "industry-etfs": "Industry ETF",
  "country-etfs": "Country ETF",
  currencies: "FX",
  commodities: "Commodity",
  india: "India",
  "hong-kong": "Hong Kong",
  singapore: "Singapore",
  japan: "Japan",
  europe: "Europe",
  "fixed-income": "Fixed Income",
  "broad-market": "Broad Market",
  "growth-value": "Growth/Value",
  "portfolio-etfs": "Portfolio ETF",
};

export function HoldingsTable({ holdings }: { holdings: PortfolioHoldingVM[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Instrument | null>(null);

  const onOpen = (inst: Instrument) => {
    setActive(inst);
    setOpen(true);
  };

  return (
    <>
      <div className="overflow-x-auto border-t">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th scope="col" className="px-2 py-2 text-left">Ticker</th>
              <th scope="col" className="px-2 py-2 text-left">Name</th>
              <th scope="col" className="px-2 py-2 text-left">Universe</th>
              <th scope="col" className="px-2 py-2 text-left">Signal</th>
              <th scope="col" className="px-2 py-2 text-right">Score</th>
              <th scope="col" className="px-2 py-2 text-right">Weight %</th>
            </tr>
          </thead>
          <tbody>
            {holdings.map((h) => {
              const inst = h.instrument;
              const rowClass = inst
                ? "cursor-pointer border-b transition-colors hover:bg-muted/40 focus-within:bg-muted/40"
                : "border-b text-muted-foreground";
              return (
                <tr
                  key={h.ticker}
                  className={rowClass}
                  {...(inst
                    ? {
                        role: "button",
                        tabIndex: 0,
                        onClick: () => onOpen(inst),
                        onKeyDown: (e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onOpen(inst);
                          }
                        },
                        "aria-label": `${h.ticker} ${inst.name} — open detail`,
                      }
                    : {})}
                >
                  <td className="px-2 py-2 font-semibold">{h.ticker}</td>
                  <td className="px-2 py-2">
                    {inst ? (
                      <span className="line-clamp-1 text-xs">{inst.name}</span>
                    ) : (
                      <span className="font-mono text-xs">—</span>
                    )}
                  </td>
                  <td className="px-2 py-2 text-xs">
                    {inst ? UNIVERSE_LABELS[inst.universe] ?? inst.universe : "—"}
                  </td>
                  <td className="px-2 py-2">
                    {inst ? (
                      <SignalBadge signal={inst.signal} />
                    ) : (
                      <span className="font-mono text-xs">—</span>
                    )}
                  </td>
                  <td
                    className={cn(
                      "px-2 py-2 text-right font-mono font-semibold",
                      inst ? scoreTextClass(inst.compositeScore) : "",
                    )}
                  >
                    {inst ? inst.compositeScore.toFixed(1) : "—"}
                  </td>
                  <td className="px-2 py-2 text-right font-mono text-xs">
                    {h.weight.toFixed(1)}%
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
