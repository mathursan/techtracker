"use client";

import { useMemo } from "react";

import { aggregateAnalytics } from "@/domain/analytics";
import type { ScoreSnapshot } from "@/domain/types";

import { ActivePresetBanner } from "@/components/shared/active-preset-banner";
import { useEffectiveInstruments } from "@/hooks/use-effective-instruments";

import { ScoreHistogramChart } from "./score-histogram-chart";
import { SectorAverageChart } from "./sector-average-chart";
import { SignalDistributionChart } from "./signal-distribution-chart";

export function AnalyticsView({ snapshot }: { snapshot: ScoreSnapshot }) {
  // Apply the active weight preset — keeps counts / averages / histogram
  // consistent with the screener's Score column (UC-11).
  const effective = useEffectiveInstruments(snapshot.instruments);
  const vm = useMemo(
    () =>
      aggregateAnalytics({
        universeLabel: snapshot.summary.displayName,
        asOf: snapshot.asOf,
        instruments: effective,
        filters: snapshot.summary.filters,
      }),
    [effective, snapshot],
  );

  return (
    <div className="flex min-h-full flex-col">
      <ActivePresetBanner />
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {vm.universeLabel} · {vm.totalCount} instruments · as of{" "}
          {new Date(vm.asOf).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
      </header>

      <div className="grid flex-1 gap-4 p-6 lg:grid-cols-2">
        <AnalyticsCard title="Signal Distribution">
          <SignalDistributionChart data={vm.signalDistribution} />
        </AnalyticsCard>
        <AnalyticsCard title="Sector Average Score">
          <SectorAverageChart data={vm.sectorAverages} />
        </AnalyticsCard>
        <AnalyticsCard title="Score Histogram" className="lg:col-span-2">
          <ScoreHistogramChart data={vm.scoreHistogram} />
        </AnalyticsCard>
      </div>
    </div>
  );
}

function AnalyticsCard({
  title,
  className = "",
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      aria-label={title}
      className={`flex flex-col rounded-lg border bg-background shadow-sm ${className}`}
    >
      <h2 className="border-b px-4 py-2 text-sm font-semibold">{title}</h2>
      <div className="flex-1 p-3">{children}</div>
    </section>
  );
}
