"use client";

import { Trash2, X } from "lucide-react";
import { useMemo } from "react";

import { buildHoldingsVM } from "@/domain/portfolio";
import type { Instrument, ScoreSnapshot } from "@/domain/types";
import { scoreTextClass } from "@/domain/colors";
import { labelForUniverse } from "@/lib/universe-labels";
import { cn } from "@/lib/utils";

import { SignalBadge } from "@/components/shared/signal-badge";
import { useTickerDetailModal } from "@/components/detail/use-ticker-detail-modal";
import { usePortfolioStore } from "@/stores/portfolio";

export function CustomPortfolioPanel({
  snapshots,
}: {
  snapshots: ReadonlyArray<ScoreSnapshot | null>;
}) {
  const hydrated = usePortfolioStore((s) => s.hydrated);
  const holdings = usePortfolioStore((s) => s.holdings);
  const remove = usePortfolioStore((s) => s.remove);
  const clear = usePortfolioStore((s) => s.clear);
  const { openDetail, modal } = useTickerDetailModal();

  const vm = useMemo(
    () => buildHoldingsVM(holdings.map((h) => ({ ticker: h.ticker })), snapshots),
    [holdings, snapshots],
  );

  if (!hydrated || holdings.length === 0) {
    return (
      <div className="m-6 grid place-items-center rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
        <div className="max-w-sm">
          <div className="font-medium text-foreground">
            {hydrated ? "Your portfolio is empty" : "Loading saved portfolio…"}
          </div>
          {hydrated && (
            <p className="mt-1 text-xs">
              Click <span className="font-mono">+</span> on a candidate below, or
              pick a preset above to get started.
            </p>
          )}
        </div>
      </div>
    );
  }

  const { score, resolvedCount, resolvedWeightTotal, unresolvedCount } = vm;

  return (
    <section aria-label="Custom portfolio" className="flex flex-col">
      <div className="flex flex-wrap items-baseline gap-6 px-6 py-4">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Score
          </div>
          <div
            className={cn(
              "font-mono text-3xl font-semibold",
              score !== null ? scoreTextClass(score) : "text-muted-foreground",
            )}
          >
            {score !== null ? score.toFixed(1) : "—"}
          </div>
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Weight
          </div>
          <div className="font-mono text-lg">{resolvedWeightTotal.toFixed(0)}%</div>
          {unresolvedCount > 0 && (
            <div className="text-[10px] uppercase tracking-wide text-amber-600 dark:text-amber-400">
              {unresolvedCount} unresolved excluded
            </div>
          )}
        </div>
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">
            Holdings ({holdings.length})
          </div>
          <div className="font-mono text-lg">
            {resolvedCount} / {holdings.length}{" "}
            <span className="text-xs text-muted-foreground">resolved</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (confirm(`Remove all ${holdings.length} holdings?`)) clear();
          }}
          className="ml-auto inline-flex items-center gap-1 rounded-md border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-rose-600 hover:text-rose-600"
        >
          <Trash2 className="h-3 w-3" aria-hidden="true" /> Clear all
        </button>
      </div>

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
              <th scope="col" className="w-12 px-2 py-2 text-right">Remove</th>
            </tr>
          </thead>
          <tbody>
            {vm.holdings.map((h) => {
              const inst: Instrument | null = h.instrument;
              return (
                <tr
                  key={h.ticker}
                  className={cn(
                    "border-b last:border-b-0 transition-colors focus-within:bg-muted/40",
                    inst ? "cursor-pointer hover:bg-muted/40" : "text-muted-foreground",
                  )}
                  {...(inst
                    ? {
                        role: "button",
                        tabIndex: 0,
                        onClick: () => openDetail(inst),
                        onKeyDown: (e: React.KeyboardEvent<HTMLTableRowElement>) => {
                          // Don't steal Enter/Space from a focused inner
                          // button (the − remove-action) — WCAG 2.1.1.
                          // Mouse clicks through the − are already handled
                          // by stopPropagation on the button.
                          if (e.currentTarget !== e.target) return;
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            openDetail(inst);
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
                    {inst ? labelForUniverse(inst.universe) : "—"}
                  </td>
                  <td className="px-2 py-2">
                    {inst ? <SignalBadge signal={inst.signal} /> : <span className="font-mono text-xs">—</span>}
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
                  <td className="px-2 py-2 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        remove(h.ticker);
                      }}
                      aria-label={`Remove ${h.ticker} from portfolio`}
                      className="inline-flex h-6 w-6 items-center justify-center rounded border border-border text-muted-foreground transition-colors hover:border-rose-600 hover:text-rose-600"
                    >
                      <X className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {modal}
    </section>
  );
}
