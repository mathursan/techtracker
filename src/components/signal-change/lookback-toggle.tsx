"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { Lookback } from "@/domain/signal-change";
import { LOOKBACKS, LOOKBACK_LABELS } from "@/domain/signal-change";
import { cn } from "@/lib/utils";

export function LookbackToggle({ active }: { active: Lookback }) {
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefFor = (value: Lookback) => {
    const next = new URLSearchParams(params.toString());
    // Default is 1m; only set the param when the non-default is selected.
    if (value === "1m") next.delete("lookback");
    else next.set("lookback", value);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav
      role="tablist"
      aria-label="Lookback window"
      className="inline-flex gap-1 rounded-md border bg-background p-1"
    >
      {LOOKBACKS.map((lb) => {
        const isActive = lb === active;
        return (
          <Link
            key={lb}
            href={hrefFor(lb)}
            role="tab"
            aria-selected={isActive}
            scroll={false}
            className={cn(
              "inline-flex items-center rounded px-3 py-1 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {LOOKBACK_LABELS[lb]}
          </Link>
        );
      })}
    </nav>
  );
}
