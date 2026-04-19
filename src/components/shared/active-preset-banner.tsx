"use client";

import { DEFAULT_WEIGHTS } from "@/domain/composite";
import type { IndicatorId } from "@/domain/types";
import { INDICATOR_IDS } from "@/domain/types";
import { useActiveWeights, useWeightPresetStore } from "@/stores/weight-preset";
import { BUILT_IN_PRESETS, isBuiltInPresetId } from "@/domain/weight-presets";

function weightsMatchDefault(): (w: Record<IndicatorId, number>) => boolean {
  return (w) => INDICATOR_IDS.every((id) => w[id] === DEFAULT_WEIGHTS[id]);
}

const isDefault = weightsMatchDefault();

export function ActivePresetBanner() {
  const activeWeights = useActiveWeights();
  const activeId = useWeightPresetStore((s) => s.activeId);
  const customPresets = useWeightPresetStore((s) => s.customPresets);
  const hydrated = useWeightPresetStore((s) => s.hydrated);

  if (!hydrated) return null;
  if (isDefault(activeWeights)) return null;

  const name = isBuiltInPresetId(activeId)
    ? BUILT_IN_PRESETS.find((p) => p.id === activeId)?.name ?? "Custom"
    : customPresets.find((p) => p.id === activeId)?.name ?? "Custom";

  return (
    <div
      role="status"
      className="border-b bg-amber-50 px-6 py-2 text-xs text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
    >
      Active preset:{" "}
      <span className="font-semibold">{name}</span>. Applies to the screener
      Score column and the Analytics charts. Signals Hub, Signal Change, and
      Portfolio aggregators ship in a phase-2 follow-up.
    </div>
  );
}
