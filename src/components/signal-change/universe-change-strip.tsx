import type { UniverseChangeSummary, AllMarketsSummary } from "@/domain/signal-change";
import type { Universe } from "@/domain/types";

import { AllMarketsCard, UniverseChangeCard } from "./universe-change-card";

export function UniverseChangeStrip({
  summaries,
  allMarkets,
  scope,
}: {
  summaries: UniverseChangeSummary[];
  allMarkets: AllMarketsSummary;
  scope: Universe | null;
}) {
  return (
    <section aria-label="Signal change by universe" className="border-b px-6 py-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Changes by market
      </div>
      <div className="flex flex-wrap gap-2">
        <AllMarketsCard
          upgrades={allMarkets.upgrades}
          downgrades={allMarkets.downgrades}
          universesWithData={allMarkets.universesWithData}
          active={scope === null}
        />
        {summaries.map((summary) => (
          <UniverseChangeCard
            key={summary.universe}
            summary={summary}
            active={scope === summary.universe}
          />
        ))}
      </div>
    </section>
  );
}
