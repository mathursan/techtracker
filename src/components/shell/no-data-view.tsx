import Link from "next/link";
import { Clock } from "lucide-react";

import type { TabDef } from "@/lib/nav";

export function NoDataView({ tab }: { tab: TabDef }) {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/20 p-12">
      <div className="max-w-md text-center">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-muted text-muted-foreground"
        >
          <Clock className="h-6 w-6" />
        </div>
        <h2 className="mb-2 text-xl font-semibold">{tab.label}</h2>
        <p className="mb-3 text-sm text-muted-foreground">
          No snapshot available yet. The scoring job writes <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">public/data/{tab.slug}.json</code>
          after the first weekday run.
        </p>
        <p className="text-xs text-muted-foreground">
          Local dev: run <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">python -m scoring.runner --universe {tab.slug}</code>
          to seed a snapshot.
        </p>
        <Link
          href={`https://github.com/mathursan/techtracker/issues/3`}
          className="mt-3 block text-sm text-primary hover:underline"
        >
          Scoring pipeline — issue #3
        </Link>
      </div>
    </main>
  );
}
