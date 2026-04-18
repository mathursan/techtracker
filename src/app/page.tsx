export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-12 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">TechTracker</h1>
      <p className="max-w-md text-lg text-muted-foreground">
        Technical Analysis Dashboard — scaffolded. The app shell (issue #1) mounts
        the screener, detail modal, portfolio builder, and analytics views here.
      </p>
      <p className="text-sm text-muted-foreground">
        See{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
          docs/replicate/IMPLEMENTATION_ROADMAP.md
        </code>{" "}
        for what lands next.
      </p>
    </main>
  );
}
