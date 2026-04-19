"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import type { SignalsHubView } from "@/domain/signals-hub";
import { cn } from "@/lib/utils";

const TABS: { view: SignalsHubView; label: string; emoji: string }[] = [
  { view: "top-buys", label: "Top Buys", emoji: "🟢" },
  { view: "top-sells", label: "Top Sells", emoji: "🔴" },
  { view: "momentum", label: "Momentum", emoji: "⚡" },
  { view: "heatmap", label: "Heatmap", emoji: "🌡️" },
];

export function ViewModeTabs({ active }: { active: SignalsHubView }) {
  const pathname = usePathname();
  const params = useSearchParams();

  const hrefFor = (view: SignalsHubView): string => {
    const next = new URLSearchParams(params.toString());
    if (view === "top-buys") next.delete("view");
    else next.set("view", view);
    const qs = next.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <nav
      role="tablist"
      aria-label="Signals Hub view mode"
      className="flex flex-wrap items-center gap-1 border-b px-6 py-3"
    >
      {TABS.map((tab) => {
        const isActive = tab.view === active;
        return (
          <Link
            key={tab.view}
            href={hrefFor(tab.view)}
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
            <span aria-hidden="true">{tab.emoji}</span>
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
