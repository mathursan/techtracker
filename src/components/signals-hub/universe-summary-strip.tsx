import type { UniverseCard } from "@/domain/signals-hub";

import { UniverseSummaryCard } from "./universe-summary-card";

export function UniverseSummaryStrip({ cards }: { cards: UniverseCard[] }) {
  return (
    <section aria-label="Universe summaries" className="border-b px-6 py-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Universes
      </div>
      <div className="flex flex-wrap gap-2">
        {cards.map((card) => (
          <UniverseSummaryCard key={card.universe} card={card} />
        ))}
      </div>
    </section>
  );
}
