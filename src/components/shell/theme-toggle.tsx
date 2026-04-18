"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

function currentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribeToThemeChanges(onChange: () => void): () => void {
  if (typeof document === "undefined") return () => undefined;
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

export function useTheme(): {
  theme: Theme;
  setTheme: (next: Theme) => void;
} {
  const theme = useSyncExternalStore<Theme>(
    subscribeToThemeChanges,
    currentTheme,
    () => "light",
  );
  return {
    theme,
    setTheme(next) {
      if (typeof document === "undefined") return;
      const cl = document.documentElement.classList;
      cl.remove("light", "dark");
      cl.add(next);
      try {
        localStorage.setItem("theme", next);
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
        "grid h-8 w-8 place-items-center rounded-md border text-muted-foreground transition-colors hover:bg-muted",
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
