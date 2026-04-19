"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ScoreBucket } from "@/domain/analytics";
import { toneForScore } from "@/domain/colors";

const TONE_FILL: Record<"green" | "amber" | "red", string> = {
  green: "#10b981",
  amber: "#f59e0b",
  red: "#f43f5e",
};

export function ScoreHistogramChart({ data }: { data: ScoreBucket[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(v: number) => [v, "Count"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count">
            {data.map((d) => {
              // Color each bucket by the tone the bucket's mid-point falls
              // into — bucket 0-1 is deeply red, 9-10 is deeply green.
              const midpoint = d.index + 0.5;
              return <Cell key={d.index} fill={TONE_FILL[toneForScore(midpoint)]} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
