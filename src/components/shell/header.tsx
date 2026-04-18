import { Moon } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div className="flex items-center gap-3">
        <div
          aria-hidden="true"
          className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-blue-600 to-violet-600 text-sm font-bold text-white"
        >
          TT
        </div>
        <h1 className="text-lg font-semibold tracking-tight">TechTracker</h1>
        <span className="text-xs text-muted-foreground">
          Technical Analysis Dashboard
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-xs text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-400">
          <span
            aria-hidden="true"
            className="h-1.5 w-1.5 rounded-full bg-green-500 ring-2 ring-green-500/20"
          />
          Live
        </span>
        <button
          type="button"
          aria-label="Toggle theme (ships in issue #2)"
          title="Toggle theme — ships in issue #2"
          className="grid h-8 w-8 place-items-center rounded-md border text-muted-foreground transition-colors hover:bg-muted"
          disabled
        >
          <Moon className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
