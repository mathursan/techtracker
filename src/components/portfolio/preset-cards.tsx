import Link from "next/link";

import type { PortfolioPreset, PresetSlug } from "@/domain/portfolio-presets";
import { cn } from "@/lib/utils";

export function PresetCards({
  presets,
  active,
}: {
  presets: readonly PortfolioPreset[];
  active: PresetSlug | null;
}) {
  return (
    <section aria-label="Preset portfolios" className="border-b px-6 py-4">
      <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Macro regime presets
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {presets.map((p) => {
          const isActive = p.slug === active;
          return (
            <Link
              key={p.slug}
              href={isActive ? "/portfolio" : `/portfolio?preset=${p.slug}`}
              scroll={false}
              aria-pressed={isActive}
              className={cn(
                "flex flex-col gap-1 rounded-lg border bg-background p-3 shadow-sm transition-colors hover:bg-muted",
                isActive && "border-primary bg-primary/10",
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden="true">
                  {p.emoji}
                </span>
                <span className="font-semibold">{p.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{p.thesis}</p>
              <div className="mt-1 text-[11px] font-mono text-muted-foreground">
                {p.holdings.length} assets
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
