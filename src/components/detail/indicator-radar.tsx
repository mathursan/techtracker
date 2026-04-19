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
import { toneForScore } from "@/domain/colors";
import { cn } from "@/lib/utils";

const LABELS: Record<string, string> = {
  ma_trend: "MA Trend",
  macd: "MACD",
  adx_dmi: "ADX/DMI",
  rsi: "RSI",
  sar: "SAR",
  bollinger: "Bollinger",
  stochastic: "Stochastic",
  obv: "OBV",
  ichimoku: "Ichimoku",
};

/**
 * Explicit hex colors so the radar reads as bullish/bearish at a glance.
 * Tailwind's emerald-500 / amber-500 / rose-500 don't map 1:1 through
 * CSS vars under the svg's `fill`, so hard-code the brand-equivalent.
 */
const TONE_STROKE: Record<"green" | "amber" | "red", string> = {
  green: "#10b981", // emerald-500
  amber: "#f59e0b", // amber-500
  red: "#f43f5e",   // rose-500
};

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
    indicator: LABELS[id] ?? id,
    score: byId.get(id) ?? 0,
  }));
  const color = TONE_STROKE[toneForScore(composite)];

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
