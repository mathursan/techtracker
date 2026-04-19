import type { Signal } from "@/domain/types";
import { signalBadgeClass } from "@/domain/colors";
import { cn } from "@/lib/utils";

export function SignalBadge({
  signal,
  className,
}: {
  signal: Signal;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        signalBadgeClass(signal),
        className,
      )}
    >
      {signal}
    </span>
  );
}
