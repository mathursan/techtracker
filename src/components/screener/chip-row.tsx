"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { UniverseSummary } from "@/domain/types";
import { ALL_CHIP_KEY, resolveChipKey } from "@/domain/filters";
import { cn } from "@/lib/utils";

export function ChipRow({
  filters,
}: {
  filters: UniverseSummary["filters"];
}) {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeKey = resolveChipKey(params.get("chip"), filters);

  if (filters.length <= 1) return null;

  return (
    <nav
      aria-label="Filter by category"
      className="flex flex-wrap gap-2 border-b px-6 py-3"
      role="tablist"
    >
      {filters.map((f) => {
        const active = f.key === activeKey;
        const href =
          f.key === ALL_CHIP_KEY
            ? pathname
            : `${pathname}?chip=${encodeURIComponent(f.key)}`;
        return (
          <Link
            key={f.key}
            href={href}
            role="tab"
            aria-selected={active}
            data-state={active ? "active" : "inactive"}
            scroll={false}
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-sm transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            {f.label}
          </Link>
        );
      })}
    </nav>
  );
}
