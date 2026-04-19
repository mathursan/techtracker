"use client";

import { Check, Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { ASSET_CLASSES, ASSET_CLASS_LABELS, assetClassForUniverse } from "@/domain/asset-class";
import type { AssetClass } from "@/domain/asset-class";
import { scoreTextClass } from "@/domain/colors";
import { normalizeSearch } from "@/domain/filters";
import type { Instrument } from "@/domain/types";
import { TABS } from "@/lib/nav";
import { cn } from "@/lib/utils";

import { SignalBadge } from "@/components/shared/signal-badge";
import { useTickerDetailModal } from "@/components/detail/use-ticker-detail-modal";
import { usePortfolioStore } from "@/stores/portfolio";

const UNIVERSE_LABELS: Partial<Record<string, string>> = Object.fromEntries(
  TABS.filter((t) => t.universe).map((t) => [t.universe as string, t.label]),
);

export function CandidateTable({ candidates }: { candidates: Instrument[] }) {
  const [assetClass, setAssetClass] = useState<AssetClass | "all">("all");
  const [query, setQuery] = useState("");
  const { openDetail, modal } = useTickerDetailModal();

  const holdings = usePortfolioStore((s) => s.holdings);
  const add = usePortfolioStore((s) => s.add);
  const held = useMemo(() => new Set(holdings.map((h) => h.ticker)), [holdings]);

  const filtered = useMemo(() => {
    const needle = normalizeSearch(query);
    return candidates.filter((inst) => {
      if (assetClass !== "all" && assetClassForUniverse(inst.universe) !== assetClass) {
        return false;
      }
      if (!needle) return true;
      return (
        inst.ticker.toLowerCase().includes(needle) ||
        inst.name.toLowerCase().includes(needle)
      );
    });
  }, [candidates, assetClass, query]);

  return (
    <>
      <section aria-label="Add holdings" className="flex flex-col gap-3 border-t px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">Add holdings</h2>
          <input
            type="text"
            placeholder="Search ticker or name"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search candidate instruments"
            className="w-64 rounded-md border px-3 py-1 text-sm shadow-sm focus:border-primary focus:outline-none"
          />
        </div>
        <nav role="tablist" aria-label="Asset class" className="flex flex-wrap gap-2">
          {(["all", ...ASSET_CLASSES] as const).map((k) => {
            const active = k === assetClass;
            const label = k === "all" ? "All" : ASSET_CLASS_LABELS[k];
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setAssetClass(k)}
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-xs transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {label}
              </button>
            );
          })}
        </nav>

        {filtered.length === 0 ? (
          <div className="grid h-24 place-items-center rounded border border-dashed text-sm text-muted-foreground">
            No matches in this filter.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th scope="col" className="px-2 py-2 text-left">Ticker</th>
                  <th scope="col" className="px-2 py-2 text-left">Name</th>
                  <th scope="col" className="px-2 py-2 text-left">Universe</th>
                  <th scope="col" className="px-2 py-2 text-left">Signal</th>
                  <th scope="col" className="px-2 py-2 text-right">Score</th>
                  <th scope="col" className="w-12 px-2 py-2 text-right">Add</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inst) => {
                  const isHeld = held.has(inst.ticker);
                  return (
                    <tr
                      key={`${inst.universe}:${inst.ticker}`}
                      role="button"
                      tabIndex={0}
                      onClick={() => openDetail(inst)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          openDetail(inst);
                        }
                      }}
                      aria-label={`${inst.ticker} ${inst.name} — open detail`}
                      className="cursor-pointer border-b last:border-b-0 transition-colors hover:bg-muted/40 focus-within:bg-muted/40"
                    >
                      <td className="px-2 py-1.5 font-semibold">{inst.ticker}</td>
                      <td className="px-2 py-1.5">
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {inst.name}
                        </span>
                      </td>
                      <td className="px-2 py-1.5 text-xs">
                        {UNIVERSE_LABELS[inst.universe] ?? inst.universe}
                      </td>
                      <td className="px-2 py-1.5">
                        <SignalBadge signal={inst.signal} />
                      </td>
                      <td
                        className={cn(
                          "px-2 py-1.5 text-right font-mono font-semibold",
                          scoreTextClass(inst.compositeScore),
                        )}
                      >
                        {inst.compositeScore.toFixed(1)}
                      </td>
                      <td className="px-2 py-1.5 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            add(inst.ticker);
                          }}
                          disabled={isHeld}
                          aria-label={isHeld ? `${inst.ticker} already in portfolio` : `Add ${inst.ticker} to portfolio`}
                          className={cn(
                            "inline-flex h-6 w-6 items-center justify-center rounded border transition-colors",
                            isHeld
                              ? "border-emerald-600 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400 cursor-default"
                              : "border-border hover:bg-primary hover:text-primary-foreground",
                          )}
                        >
                          {isHeld ? (
                            <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          ) : (
                            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
      {modal}
    </>
  );
}
