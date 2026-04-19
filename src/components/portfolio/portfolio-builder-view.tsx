import type { PortfolioVM } from "@/domain/portfolio";
import type { PortfolioPreset, PresetSlug } from "@/domain/portfolio-presets";
import type { Instrument, ScoreSnapshot } from "@/domain/types";

import { CandidateTable } from "./candidate-table";
import { CustomPortfolioPanel } from "./custom-portfolio-panel";
import { CustomizePresetButton } from "./customize-preset-button";
import { PortfolioPanel } from "./portfolio-panel";
import { PresetCards } from "./preset-cards";

export function PortfolioBuilderView({
  presets,
  activeSlug,
  vm,
  snapshots,
  candidates,
}: {
  presets: readonly PortfolioPreset[];
  activeSlug: PresetSlug | null;
  vm: PortfolioVM | null;
  snapshots: ReadonlyArray<ScoreSnapshot | null>;
  candidates: Instrument[];
}) {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Portfolio Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Load a macro-regime preset or build your own. Custom portfolios
          persist in this browser via localStorage.
        </p>
      </header>

      <PresetCards presets={presets} active={activeSlug} />

      {vm ? (
        <>
          <PortfolioPanel vm={vm} />
          <div className="flex items-center gap-3 border-t px-6 py-3 text-xs text-muted-foreground">
            <span>Ready to edit?</span>
            <CustomizePresetButton preset={vm.preset} />
          </div>
        </>
      ) : (
        <CustomPortfolioPanel snapshots={snapshots} />
      )}

      <CandidateTable candidates={candidates} />
    </div>
  );
}
