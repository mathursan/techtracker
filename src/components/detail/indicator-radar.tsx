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

export function IndicatorRadar({
  scores,
  className,
}: {
  scores: IndicatorScore[];
  className?: string;
}) {
  const byId = new Map(scores.map((s) => [s.id, s.value] as const));
  const data = INDICATOR_IDS.map((id) => ({
    indicator: LABELS[id] ?? id,
    score: byId.get(id) ?? 0,
  }));

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
            stroke="currentColor"
            fill="currentColor"
            fillOpacity={0.25}
            className="text-primary"
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
