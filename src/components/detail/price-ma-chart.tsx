"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn } from "@/lib/utils";

export function PriceMaChart({
  points,
  className,
}: {
  points: number[];
  className?: string;
}) {
  if (points.length < 2) {
    return (
      <div className={cn("grid h-64 place-items-center text-sm text-muted-foreground", className)}>
        Not enough price history to plot.
      </div>
    );
  }
  const data = points.map((close, i) => ({ i, close }));

  return (
    <div className={cn("h-64 w-full", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />
          <XAxis
            dataKey="i"
            tick={{ fontSize: 10 }}
            tickFormatter={(v) => `t-${data.length - 1 - Number(v)}`}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10 }}
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
            width={52}
          />
          <Tooltip
            labelFormatter={(v) => `${data.length - 1 - Number(v)} bars ago`}
            formatter={(v: number) => [`$${v.toFixed(2)}`, "Close"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="close"
            stroke="currentColor"
            strokeWidth={1.5}
            dot={false}
            className="text-primary"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
