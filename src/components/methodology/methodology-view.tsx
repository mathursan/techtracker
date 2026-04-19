import { BandsTable } from "./bands-table";
import { CliReference } from "./cli-reference";
import { PresetChipRow } from "./preset-chip-row";
import { WeightSliderGrid } from "./weight-slider-grid";

export function MethodologyView() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b px-6 py-4">
        <h1 className="text-xl font-semibold tracking-tight">Methodology</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every composite score is a weighted mean of nine technical indicators.
          Switch presets, tune weights, and save your own — the screener&apos;s
          Score column updates in real time.
        </p>
      </header>

      <PresetChipRow />
      <WeightSliderGrid />
      <BandsTable />
      <CliReference />
    </div>
  );
}
