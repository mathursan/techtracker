"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { IndicatorScore } from "@/domain/types";
import { INDICATOR_IDS } from "@/domain/types";
import { TONE_HEX, toneForScore } from "@/domain/colors";
import { INDICATOR_LABELS } from "@/lib/indicator-labels";
import { cn } from "@/lib/utils";

export function IndicatorRadar({
  scores,
  composite,
  className,
}: {
  scores: IndicatorScore[];
  /** Composite score; drives the radar's stroke / fill color. */
  composite: number;
  className?: string;
}) {
  const byId = new Map(scores.map((s) => [s.id, s.value] as const));
  const data = INDICATOR_IDS.map((id) => ({
    indicator: INDICATOR_LABELS[id],
    score: byId.get(id) ?? 0,
  }));
  const color = TONE_HEX[toneForScore(composite)];

  return (
    <div className={cn("h-64 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="75%">
          <PolarGrid strokeOpacity={0.25} />
          <PolarAngleAxis dataKey="indicator" tick={{ fontSize: 10 }} />
          <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fontSize: 9 }} />
          <Tooltip
            formatter={(v: number) => [v.toFixed(1), "Score"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Radar
            name="Score"
            dataKey="score"
            stroke={color}
            fill={color}
            fillOpacity={0.25}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
