export function CliReference() {
  return (
    <section aria-label="CLI reference" className="flex flex-col gap-2 border-b px-6 py-4">
      <h2 className="text-sm font-semibold">CLI reference</h2>
      <p className="text-xs text-muted-foreground">
        The Python scoring pipeline publishes the JSON snapshots this dashboard
        reads. Run locally or in CI.
      </p>
      <pre className="overflow-x-auto rounded-md border bg-muted/40 p-4 font-mono text-xs leading-relaxed">
        <code>{`# Install the scoring package (Python ≥ 3.11)
python -m venv .venv
source .venv/bin/activate
python -m pip install -e .

# Score one universe
python -m scoring.runner --universe stocks

# Score all universes + write snapshots to public/data/
python -m scoring.runner --all --out public/data

# Test indicators + bands + contract
python -m pytest scoring/`}</code>
      </pre>
      <p className="text-[11px] text-muted-foreground">
        Scheduled runs live in <code className="font-mono">.github/workflows/scoring.yml</code>;
        artifacts land in <code className="font-mono">public/data/&lt;universe&gt;.json</code>.
      </p>
    </section>
  );
}
