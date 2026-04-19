"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useState } from "react";

import type { Instrument } from "@/domain/types";
import { performanceTextClass, scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

import { SignalBadge } from "@/components/shared/signal-badge";
import { IndicatorRadar } from "./indicator-radar";
import { IndicatorScoresPanel } from "./indicator-scores-panel";
import { PriceMaChart } from "./price-ma-chart";

const TIMEFRAMES = ["1M", "3M", "6M", "1Y", "2Y", "5Y"] as const;
type Timeframe = (typeof TIMEFRAMES)[number];

const CHART_KINDS = [
  "Price",
  "RSI",
  "MACD",
  "Bollinger",
  "Stochastic",
  "Volume",
  "Radar",
] as const;
type ChartKind = (typeof CHART_KINDS)[number];

/** Chart tabs that need full per-timeframe history — placeholder until
 * the scoring pipeline publishes it. Tracked as a follow-up to #9. */
const HISTORY_DEPENDENT: ReadonlySet<ChartKind> = new Set([
  "RSI",
  "MACD",
  "Bollinger",
  "Stochastic",
  "Volume",
]);

export function TickerDetailModal({
  instrument,
  open,
  onOpenChange,
}: {
  instrument: Instrument | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [timeframe, setTimeframe] = useState<Timeframe>("1Y");
  const [chartKind, setChartKind] = useState<ChartKind>("Price");

  if (!instrument) return null;

  const perfChips: { label: string; value?: number }[] = [
    { label: "1M", value: instrument.perfOneMonth },
    { label: "3M", value: instrument.perfThreeMonth },
    { label: "1Y", value: instrument.perfOneYear },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 grid w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 gap-4 overflow-hidden rounded-lg border bg-background p-6 shadow-lg focus:outline-none sm:rounded-lg"
          aria-describedby="ticker-detail-description"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <Dialog.Title className="text-xl font-semibold tracking-tight">
                  {instrument.ticker}
                </Dialog.Title>
                <span className={cn("font-mono text-sm font-semibold", scoreTextClass(instrument.compositeScore))}>
                  {instrument.compositeScore.toFixed(1)}
                </span>
                <SignalBadge signal={instrument.signal} />
              </div>
              <div className="text-sm text-muted-foreground">
                {instrument.name}
                {instrument.sector ? ` · ${instrument.sector}` : null}
              </div>
              <Dialog.Description id="ticker-detail-description" className="sr-only">
                Detailed scoring breakdown for {instrument.ticker}
              </Dialog.Description>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-sm">
                <span className="font-mono font-semibold">${instrument.price.toFixed(2)}</span>
                {perfChips.map((chip) =>
                  chip.value == null ? null : (
                    <span
                      key={chip.label}
                      className={cn("font-mono text-xs", performanceTextClass(chip.value))}
                    >
                      {chip.label}:{" "}
                      {chip.value >= 0 ? "+" : ""}
                      {chip.value.toFixed(2)}%
                    </span>
                  ),
                )}
              </div>
            </div>
            <Dialog.Close
              className="grid h-8 w-8 shrink-0 place-items-center rounded-md border text-muted-foreground transition-colors hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>

          <div className="flex flex-wrap items-center gap-2" role="tablist" aria-label="Timeframe">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                type="button"
                role="tab"
                aria-selected={tf === timeframe}
                onClick={() => setTimeframe(tf)}
                className={cn(
                  "rounded border px-2 py-0.5 text-xs font-medium transition-colors",
                  tf === timeframe
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-muted-foreground hover:bg-muted",
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Chart kind">
            {CHART_KINDS.map((kind) => (
              <button
                key={kind}
                type="button"
                role="tab"
                aria-selected={kind === chartKind}
                onClick={() => setChartKind(kind)}
                className={cn(
                  "rounded px-2 py-1 text-xs font-medium transition-colors",
                  kind === chartKind
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/70",
                )}
              >
                {kind}
              </button>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-[1fr_auto]">
            <div className="min-w-0">
              {chartKind === "Price" && (
                <PriceMaChart points={instrument.sparkline} />
              )}
              {chartKind === "Radar" && (
                <IndicatorRadar
                  scores={instrument.indicators}
                  composite={instrument.compositeScore}
                />
              )}
              {HISTORY_DEPENDENT.has(chartKind) && (
                <div className="grid h-64 place-items-center rounded border border-dashed text-center text-sm text-muted-foreground">
                  <div className="max-w-xs">
                    <div className="font-medium text-foreground">
                      {chartKind} chart
                    </div>
                    <p className="mt-1 text-xs">
                      Per-timeframe history lands when the scoring pipeline
                      publishes per-ticker series. Follow-up to UC-05.
                    </p>
                  </div>
                </div>
              )}
              <p className="mt-2 text-xs text-muted-foreground">
                Timeframe: <span className="font-medium">{timeframe}</span> ·
                showing data available in the snapshot.
              </p>
            </div>
            <div className="min-w-[20rem]">
              <IndicatorScoresPanel scores={instrument.indicators} />
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
