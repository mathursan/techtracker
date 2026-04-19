"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const DEBOUNCE_MS = 150;

export function SearchInput({ className }: { className?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Initial value from URL. If the URL changes from outside (back/forward,
  // tab switch), the component will re-key on the pathname — see the `key`
  // prop applied by the parent wrapper in ScreenerView. We don't sync
  // URL → local inside here because setState-in-effect is a React 19 smell.
  const [value, setValue] = useState(() => params.get("q") ?? "");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = new URLSearchParams(Array.from(params.entries()));
      const trimmed = value.trim();
      const existing = current.get("q") ?? "";
      if (trimmed === existing) return;
      if (trimmed.length === 0) current.delete("q");
      else current.set("q", trimmed);
      const qs = current.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value, pathname, params, router]);

  const clear = () => setValue("");

  return (
    <div className={cn("relative w-full max-w-sm px-6 py-3", className)}>
      <div className="relative">
        <Search
          aria-hidden="true"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
        />
        <input
          type="search"
          placeholder="Search ticker or name..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-label="Search ticker or name"
          className="h-9 w-full rounded-md border bg-background pl-9 pr-9 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
        {value.length > 0 && (
          <button
            type="button"
            onClick={clear}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
