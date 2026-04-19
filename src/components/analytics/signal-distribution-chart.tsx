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

import type { SignalBucket } from "@/domain/analytics";
import type { Signal } from "@/domain/types";

/** Hex colors matched to the band tone so the chart reads bullish / bearish
 * at a glance. Tailwind tokens don't pipe through SVG `fill` cleanly, so
 * hard-code the brand-equivalent here. */
const SIGNAL_FILL: Record<Signal, string> = {
  "Strong Sell": "#f43f5e",  // rose-500
  Sell: "#fb7185",           // rose-400
  Neutral: "#94a3b8",        // slate-400
  Buy: "#34d399",            // emerald-400
  "Strong Buy": "#10b981",   // emerald-500
};

export function SignalDistributionChart({ data }: { data: SignalBucket[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
          <XAxis dataKey="signal" tick={{ fontSize: 10 }} />
          <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
          <Tooltip
            formatter={(v: number) => [v, "Count"]}
            contentStyle={{ fontSize: 12 }}
          />
          <Bar dataKey="count">
            {data.map((d) => (
              <Cell key={d.signal} fill={SIGNAL_FILL[d.signal]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
