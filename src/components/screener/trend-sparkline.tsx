import { cn } from "@/lib/utils";

/**
 * Tiny SVG sparkline. Color is driven by the 1-month percent change passed
 * in explicitly — keeps the color decision out of this component so callers
 * can reuse the same line with different semantic colors later.
 */
export function TrendSparkline({
  points,
  perfOneMonth,
  width = 80,
  height = 24,
  className,
}: {
  points: number[];
  perfOneMonth: number;
  width?: number;
  height?: number;
  className?: string;
}) {
  if (points.length < 2) return <div className={cn("h-6 w-20", className)} aria-hidden />;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = Math.max(max - min, 1e-9);
  const step = width / (points.length - 1);

  const d = points
    .map((value, i) => {
      const x = i * step;
      const y = height - ((value - min) / range) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");

  const stroke = perfOneMonth >= 0 ? "stroke-emerald-500" : "stroke-rose-500";

  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      className={cn("overflow-visible", className)}
    >
      <path
        d={d}
        fill="none"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={stroke}
      />
    </svg>
  );
}
