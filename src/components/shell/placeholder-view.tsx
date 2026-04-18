import Link from "next/link";

import type { TabDef } from "@/lib/nav";

const GITHUB_ISSUE_URL = "https://github.com/mathursan/techtracker/issues";

export function PlaceholderView({ tab }: { tab: TabDef }) {
  const Icon = tab.icon;
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/20 p-12">
      <div className="max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground"
        >
          <Icon className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">{tab.label}</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          Ships in{" "}
          <span className="font-medium text-foreground">
            UC-{String(tab.plannedIssue).padStart(2, "0")}
          </span>
          . This shell renders the chrome and routes every tab for now.
        </p>
        <Link
          href={`${GITHUB_ISSUE_URL}/${tab.plannedIssue}`}
          className="text-sm text-primary hover:underline"
        >
          GitHub #{tab.plannedIssue} — track implementation
        </Link>
      </div>
    </main>
  );
}
