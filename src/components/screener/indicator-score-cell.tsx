import { scoreTextClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

export function IndicatorScoreCell({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span
      className={cn("font-mono text-xs font-semibold", scoreTextClass(value), className)}
    >
      {value.toFixed(1)}
    </span>
  );
}
