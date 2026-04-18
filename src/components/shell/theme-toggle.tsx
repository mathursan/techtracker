"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const DEFAULT_THEME: Theme = "light";
const THEME_STORAGE_KEY = "theme";

function currentTheme(): Theme {
  if (typeof document === "undefined") return DEFAULT_THEME;
  return document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
}

/**
 * Subscribes to three sources:
 * 1. MutationObserver on <html> class — picks up our own setTheme calls and
 *    any other code that flips the class (future preset loaders, etc.).
 * 2. `storage` event — cross-tab sync when another tab writes `theme`.
 * 3. matchMedia change — system preference flips while we're open and the
 *    user has no explicit stored preference.
 */
function subscribeToThemeChanges(onChange: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;

  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const onStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    const next: Theme = event.newValue === "dark" ? "dark" : "light";
    const cl = document.documentElement.classList;
    cl.remove("light", "dark");
    cl.add(next);
  };
  window.addEventListener("storage", onStorage);

  const mq =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-color-scheme: dark)")
      : null;
  const onMediaChange = () => {
    try {
      if (localStorage.getItem(THEME_STORAGE_KEY)) return;
    } catch {
      /* ignore */
    }
    const cl = document.documentElement.classList;
    cl.remove("light", "dark");
    cl.add(mq?.matches ? "dark" : "light");
  };
  mq?.addEventListener?.("change", onMediaChange);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", onStorage);
    mq?.removeEventListener?.("change", onMediaChange);
  };
}

export function useTheme(): {
  theme: Theme;
  setTheme: (next: Theme) => void;
} {
  const theme = useSyncExternalStore<Theme>(
    subscribeToThemeChanges,
    currentTheme,
    () => DEFAULT_THEME,
  );
  return {
    theme,
    setTheme(next) {
      if (typeof document === "undefined") return;
      const cl = document.documentElement.classList;
      cl.remove("light", "dark");
      cl.add(next);
      try {
        localStorage.setItem(THEME_STORAGE_KEY, next);
      } catch {
        /* ignore private-mode failures */
      }
    },
  };
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to light theme" : "Switch to dark theme";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "grid h-8 w-8 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted",
        className,
      )}
    >
      {isDark ? (
        <Sun className="h-4 w-4" aria-hidden="true" />
      ) : (
        <Moon className="h-4 w-4" aria-hidden="true" />
      )}
    </button>
  );
}
