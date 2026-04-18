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
        <span
          className="inline-flex items-center gap-1.5 rounded-full border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
          title="Snapshots refresh once per weekday after US market close."
        >
          EOD
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
