"use client";

import { normalizeSliderAdjustment } from "@/domain/weight-presets";
import type { IndicatorId, Weights } from "@/domain/types";
import { INDICATOR_IDS } from "@/domain/types";
import { useActiveWeights, useWeightPresetStore } from "@/stores/weight-preset";

import {
  INDICATOR_DESCRIPTIONS,
  INDICATOR_LABELS,
} from "./indicator-metadata";

export function WeightSliderGrid() {
  const weights = useActiveWeights();
  const setDraft = useWeightPresetStore((s) => s.setDraft);

  const handleChange = (id: IndicatorId, value: number) => {
    const next = normalizeSliderAdjustment(weights, id, value);
    setDraft(next);
  };

  const total = INDICATOR_IDS.reduce((s, id) => s + weights[id], 0);

  return (
    <section
      aria-label="Indicator weights"
      className="flex flex-col gap-2 border-b px-6 py-4"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold">Indicator weights</h2>
        <span className="font-mono text-xs text-muted-foreground">
          total: <span className="font-semibold text-foreground">{total}%</span>
        </span>
      </div>
      <div className="grid gap-3">
        {INDICATOR_IDS.map((id) => (
          <WeightSliderRow
            key={id}
            id={id}
            value={weights[id]}
            onChange={(v) => handleChange(id, v)}
          />
        ))}
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        Dragging a slider redistributes the others proportionally so the total
        stays at 100%. Active weights apply to the screener Score column in this
        phase; cross-tab aggregator recomputation ships in a follow-up.
      </p>
    </section>
  );
}

function WeightSliderRow({
  id,
  value,
  onChange,
}: {
  id: IndicatorId;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="grid grid-cols-[8rem_4rem_1fr_minmax(18rem,2fr)] items-center gap-3">
      <label htmlFor={`w-${id}`} className="text-sm font-medium">
        {INDICATOR_LABELS[id]}
      </label>
      <span className="font-mono text-xs font-semibold">{value}%</span>
      <input
        id={`w-${id}`}
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-muted accent-primary"
        aria-label={`Weight for ${INDICATOR_LABELS[id]}`}
      />
      <p className="text-xs text-muted-foreground">
        {INDICATOR_DESCRIPTIONS[id]}
      </p>
    </div>
  );
}

export type { Weights };
