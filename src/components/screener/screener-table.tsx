"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useMemo, useState } from "react";

import type { Instrument, IndicatorId } from "@/domain/types";
import { INDICATOR_IDS } from "@/domain/types";
import { SIGNAL_SEVERITY } from "@/domain/bands";
import { performanceTextClass, scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

import { SignalBadge } from "./signal-badge";
import { IndicatorScoreCell } from "./indicator-score-cell";
import { TrendSparkline } from "./trend-sparkline";

const INDICATOR_HEADER_LABELS: Record<IndicatorId, string> = {
  ma_trend: "MA Trend",
  macd: "MACD",
  adx_dmi: "ADX/DMI",
  rsi: "RSI",
  sar: "SAR",
  bollinger: "Bollinger",
  stochastic: "Stochastic",
  obv: "OBV",
  ichimoku: "Ichimoku",
};

type SortKey =
  | "ticker"
  | "compositeScore"
  | "signal"
  | "price"
  | "perfOneMonth"
  | "perfThreeMonth"
  | `indicator:${IndicatorId}`;

type SortState = { key: SortKey; direction: "asc" | "desc" };

function indicatorValue(inst: Instrument, id: IndicatorId): number | null {
  return inst.indicators.find((i) => i.id === id)?.value ?? null;
}

function sortKeyValue(inst: Instrument, key: SortKey): number | string {
  switch (key) {
    case "ticker":
      return inst.ticker;
    case "compositeScore":
      return inst.compositeScore;
    case "signal":
      return SIGNAL_SEVERITY[inst.signal];
    case "price":
      return inst.price;
    case "perfOneMonth":
      return inst.perfOneMonth;
    case "perfThreeMonth":
      return inst.perfThreeMonth;
    default: {
      const id = key.split(":")[1] as IndicatorId;
      // Missing indicator values sort to the end regardless of direction —
      // "unknown" is not a neutral 5, and it's not zero.
      return indicatorValue(inst, id) ?? Number.NEGATIVE_INFINITY;
    }
  }
}

function sortInstruments(
  rows: Instrument[],
  { key, direction }: SortState,
): Instrument[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = sortKeyValue(a, key);
    const bv = sortKeyValue(b, key);
    if (typeof av === "string" && typeof bv === "string") {
      return av.localeCompare(bv) * dir;
    }
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * dir;
    }
    return 0;
  });
}

export function ScreenerTable({ instruments }: { instruments: Instrument[] }) {
  const [sort, setSort] = useState<SortState>({
    key: "compositeScore",
    direction: "desc",
  });

  const rows = useMemo(() => sortInstruments(instruments, sort), [instruments, sort]);

  const onHeaderClick = (key: SortKey) => () => {
    setSort((prev) =>
      prev.key === key
        ? { key, direction: prev.direction === "asc" ? "desc" : "asc" }
        : { key, direction: isTextColumn(key) ? "asc" : "desc" },
    );
  };

  if (instruments.length === 0) {
    return (
      <div className="border-t p-12 text-center text-sm text-muted-foreground">
        No matches. Try clearing the search or filter.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border-t">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <Th sort={sort} onClick={onHeaderClick} colKey="ticker" className="w-44 text-left">
              Ticker
            </Th>
            <Th sort={sort} onClick={onHeaderClick} colKey="compositeScore" className="w-16 text-right">
              Score
            </Th>
            <Th sort={sort} onClick={onHeaderClick} colKey="signal" className="w-28 text-left">
              Signal
            </Th>
            <Th sort={sort} onClick={onHeaderClick} colKey="price" className="w-24 text-right">
              Price
            </Th>
            <Th sort={sort} onClick={onHeaderClick} colKey="perfOneMonth" className="w-20 text-right">
              1M %
            </Th>
            <Th sort={sort} onClick={onHeaderClick} colKey="perfThreeMonth" className="w-20 text-right">
              3M %
            </Th>
            <th className="w-24 px-2 py-2 text-left">Trend</th>
            {INDICATOR_IDS.map((id) => (
              <Th
                key={id}
                sort={sort}
                onClick={onHeaderClick}
                colKey={`indicator:${id}` as const}
                className="w-20 text-right"
              >
                {INDICATOR_HEADER_LABELS[id]}
              </Th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((inst) => (
            <tr
              key={inst.ticker}
              className="border-b transition-colors hover:bg-muted/40"
            >
              <td className="px-2 py-2">
                <div className="font-semibold">{inst.ticker}</div>
                <div className="text-xs text-muted-foreground line-clamp-1">{inst.name}</div>
              </td>
              <td className={cn("px-2 py-2 text-right font-mono font-semibold", scoreTextClass(inst.compositeScore))}>
                {inst.compositeScore.toFixed(1)}
              </td>
              <td className="px-2 py-2 text-left">
                <SignalBadge signal={inst.signal} />
              </td>
              <td className="px-2 py-2 text-right font-mono">${inst.price.toFixed(2)}</td>
              <td className={cn("px-2 py-2 text-right font-mono", performanceTextClass(inst.perfOneMonth))}>
                {inst.perfOneMonth >= 0 ? "+" : ""}
                {inst.perfOneMonth.toFixed(2)}%
              </td>
              <td className={cn("px-2 py-2 text-right font-mono", performanceTextClass(inst.perfThreeMonth))}>
                {inst.perfThreeMonth >= 0 ? "+" : ""}
                {inst.perfThreeMonth.toFixed(2)}%
              </td>
              <td className="px-2 py-2">
                <TrendSparkline points={inst.sparkline} perfOneMonth={inst.perfOneMonth} />
              </td>
              {INDICATOR_IDS.map((id) => (
                <td key={id} className="px-2 py-2 text-right">
                  {indicatorValue(inst, id) !== null ? (
                    <IndicatorScoreCell value={indicatorValue(inst, id)!} />
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isTextColumn(key: SortKey): boolean {
  return key === "ticker";
}

function Th({
  children,
  sort,
  onClick,
  colKey,
  className,
}: {
  children: React.ReactNode;
  sort: SortState;
  onClick: (key: SortKey) => () => void;
  colKey: SortKey;
  className?: string;
}) {
  const active = sort.key === colKey;
  const Icon = !active ? ArrowUpDown : sort.direction === "asc" ? ArrowUp : ArrowDown;
  return (
    <th scope="col" className={cn("px-2 py-2 font-medium", className)}>
      <button
        type="button"
        onClick={onClick(colKey)}
        className={cn(
          "inline-flex items-center gap-1 transition-colors hover:text-foreground",
          active && "text-foreground",
        )}
      >
        {children}
        <Icon className="h-3 w-3" aria-hidden="true" />
      </button>
    </th>
  );
}

// Exported for unit tests.
export { sortInstruments };
export type { SortState, SortKey };
