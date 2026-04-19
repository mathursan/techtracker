import type { PortfolioVM } from "@/domain/portfolio";
import type { PortfolioPreset, PresetSlug } from "@/domain/portfolio-presets";

import { PortfolioPanel } from "./portfolio-panel";
import { PresetCards } from "./preset-cards";

export function PortfolioBuilderView({
  presets,
  activeSlug,
  vm,
}: {
  presets: readonly PortfolioPreset[];
  activeSlug: PresetSlug | null;
  vm: PortfolioVM | null;
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Portfolio Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Load a macro-regime preset to see its technical score. Custom holdings
          and weight editing land with UC-09.
        </p>
      </header>

      <PresetCards presets={presets} active={activeSlug} />

      {vm ? (
        <PortfolioPanel vm={vm} />
      ) : (
        <div className="m-6 grid place-items-center rounded-lg border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">
          <div className="max-w-sm">
            <div className="font-medium text-foreground">
              Pick a preset to load a model portfolio
            </div>
            <p className="mt-1 text-xs">
              Each card is a curated, static holdings list. Click to populate the
              portfolio panel with the current scores from your published snapshots.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
