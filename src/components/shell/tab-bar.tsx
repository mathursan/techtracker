"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

import { cn } from "@/lib/utils";
import { TABS, type TabDef } from "@/lib/nav";

function currentSlugFromPathname(pathname: string): string {
  const trimmed = pathname.replace(/^\//, "").replace(/\/.*$/, "");
  return trimmed.length > 0 ? trimmed : "stocks";
}

function TabRow({
  tabs,
  indexOffset,
  activeSlug,
  onKeyDown,
  tabRefs,
}: {
  tabs: readonly TabDef[];
  /** Global index of the first tab in this row inside the flat tab list. */
  indexOffset: number;
  activeSlug: string;
  onKeyDown: (event: React.KeyboardEvent, globalIndex: number) => void;
  tabRefs: React.MutableRefObject<(HTMLAnchorElement | null)[]>;
}) {
  return (
    <div className="flex flex-wrap gap-1.5 sm:flex-wrap max-sm:flex-nowrap max-sm:overflow-x-auto max-sm:pb-1">
      {tabs.map((tab, index) => {
        const globalIndex = indexOffset + index;
        const isActive = tab.slug === activeSlug;
        const Icon = tab.icon;
        return (
          <Link
            key={tab.slug}
            ref={(node) => {
              tabRefs.current[globalIndex] = node;
            }}
            href={`/${tab.slug}`}
            role="tab"
            aria-selected={isActive}
            aria-current={isActive ? "page" : undefined}
            tabIndex={isActive ? 0 : -1}
            data-state={isActive ? "active" : "inactive"}
            onKeyDown={(event) => onKeyDown(event, globalIndex)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border border-transparent px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{tab.label}</span>
            {tab.flagBadge ? (
              <span className="rounded bg-black/5 px-1 text-[10px] font-semibold tracking-wide text-foreground/70 dark:bg-white/10">
                {tab.flagBadge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </div>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const activeSlug = currentSlugFromPathname(pathname);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const onKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      const focusAt = (i: number) => {
        const el = tabRefs.current[i];
        if (el) el.focus();
      };
      switch (event.key) {
        case "ArrowRight": {
          event.preventDefault();
          focusAt((index + 1) % TABS.length);
          break;
        }
        case "ArrowLeft": {
          event.preventDefault();
          focusAt((index - 1 + TABS.length) % TABS.length);
          break;
        }
        case "Home": {
          event.preventDefault();
          focusAt(0);
          break;
        }
        case "End": {
          event.preventDefault();
          focusAt(TABS.length - 1);
          break;
        }
        case "Enter":
        case " ": {
          event.preventDefault();
          router.push(`/${TABS[index].slug}`);
          break;
        }
        default:
          break;
      }
    },
    [router],
  );

  useEffect(() => {
    const idx = TABS.findIndex((tab) => tab.slug === activeSlug);
    if (idx < 0) return;
    const el = tabRefs.current[idx];
    // jsdom doesn't implement scrollIntoView; guard so tests don't need a polyfill.
    if (el?.scrollIntoView) {
      el.scrollIntoView({ inline: "center", block: "nearest" });
    }
  }, [activeSlug]);

  const row1 = TABS.filter((t) => t.row === 1);
  const row2 = TABS.filter((t) => t.row === 2);

  return (
    <nav
      role="tablist"
      aria-label="TechTracker sections"
      className="border-b px-6 pb-2 pt-1"
    >
      <TabRow
        tabs={row1}
        indexOffset={0}
        activeSlug={activeSlug}
        onKeyDown={onKeyDown}
        tabRefs={tabRefs}
      />
      <div className="mt-1.5">
        <TabRow
          tabs={row2}
          indexOffset={row1.length}
          activeSlug={activeSlug}
          onKeyDown={onKeyDown}
          tabRefs={tabRefs}
        />
      </div>
    </nav>
  );
}
