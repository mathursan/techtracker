"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { Direction } from "@/domain/signal-change";
import { cn } from "@/lib/utils";

const DIRECTION_TABS: { value: Direction; label: string; icon: string }[] = [
  { value: "all", label: "All Changes", icon: "🔄" },
  { value: "up", label: "Upgrades", icon: "⬆" },
  { value: "down", label: "Downgrades", icon: "⬇" },
];

export function DirectionTabs({ active }: { active: Direction }) {
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefFor = (value: Direction) => {
    const next = new URLSearchParams(params.toString());
    if (value === "all") next.delete("direction");
    else next.set("direction", value);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav
      role="tablist"
      aria-label="Direction filter"
      className="flex flex-wrap items-center gap-1 border-b px-6 py-3"
    >
      {DIRECTION_TABS.map((tab) => {
        const isActive = tab.value === active;
        return (
          <Link
            key={tab.value}
            href={hrefFor(tab.value)}
            role="tab"
            aria-selected={isActive}
            scroll={false}
            className={cn(
              "inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <span aria-hidden="true">{tab.icon}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
