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

import type { SectorAverage } from "@/domain/analytics";
import { toneForScore } from "@/domain/colors";

const TONE_FILL: Record<"green" | "amber" | "red", string> = {
  green: "#10b981",  // emerald-500
  amber: "#f59e0b",  // amber-500
  red: "#f43f5e",    // rose-500
};

export function SectorAverageChart({ data }: { data: SectorAverage[] }) {
  if (data.length === 0) {
    return (
      <div className="grid h-64 place-items-center rounded border border-dashed text-sm text-muted-foreground">
        No sector tags on any instrument in this snapshot.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 16, left: 100, bottom: 8 }}
        >
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis type="number" domain={[0, 10]} tick={{ fontSize: 10 }} />
          <YAxis
            dataKey="label"
            type="category"
            tick={{ fontSize: 10 }}
            width={100}
          />
          <Tooltip
            formatter={(v: number) => [v.toFixed(1), "Avg Score"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="avgScore">
            {data.map((d) => (
              <Cell key={d.key} fill={TONE_FILL[toneForScore(d.avgScore)]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
