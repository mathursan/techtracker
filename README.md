# TechTracker

A close replica of [st-technical-analysis.lovable.app](https://st-technical-analysis.lovable.app) — a technical-analysis dashboard that scores global markets (US equities, sector/industry/country ETFs, currencies, commodities, India/HK/SG/JP/Europe equities, fixed income, broad market and growth/value funds) across 9 technical indicators.

## Stack

- **Frontend**: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind 4 · Radix / shadcn-style primitives · Recharts · TanStack Query/Table · Zustand · next-themes.
- **Scoring pipeline**: Python 3.11+ package (`scoring/`) publishing per-universe JSON snapshots under `public/data/` + 35-day history. Runs on GitHub Actions cron, 30 min after US close.
- **Test**: Vitest (unit), Playwright (E2E), pytest (Python), TS↔Python contract test for signal bands.
- **Hosting**: Vercel (auto-deploy `main`).
- **No** auth, no DB, no server-persisted user state.

Full stack rationale + layer diagram lives at [`docs/architecture/architecture.md`](docs/architecture/architecture.md).

## Setup

```bash
# Clone and install
pnpm install

# Python scoring package — use the project venv
python3 -m venv .venv
source .venv/bin/activate
pip install -e ".[dev]"
```

## Common commands

```bash
# Frontend
pnpm dev           # next dev (Turbopack)
pnpm build         # production build
pnpm lint          # eslint
pnpm typecheck     # tsc --noEmit
pnpm test          # vitest
pnpm test:e2e      # playwright (boots a dev server)

# Scoring pipeline
.venv/bin/pytest scoring/        # Python unit + contract tests
python -m scoring.runner         # write a placeholder snapshot per universe
python -m scoring.runner --universe stocks

# Fixture regeneration (TS -> Python contract)
pnpm exec tsx src/domain/__fixtures__/generate.ts
```

## Contributing

Read [`CLAUDE.md`](CLAUDE.md) for the project-level rules (including the four-agent PR review gate) and [`docs/CONTRIBUTING.md`](docs/CONTRIBUTING.md) for the developer pick-up guide. Each GitHub issue corresponds to a use case documented under [`docs/replicate/analysis/uc-*.md`](docs/replicate/analysis/) — that file is the acceptance spec.

## Data model

See [`src/domain/types.ts`](src/domain/types.ts) and [`docs/replicate/reports/data-models.md`](docs/replicate/reports/data-models.md). The canonical score-to-signal mapping lives in [`src/domain/bands.ts`](src/domain/bands.ts) and is mirrored verbatim in [`scoring/domain/bands.py`](scoring/domain/bands.py); a fixture-based contract test keeps them aligned.

## License

[MIT](LICENSE). Replica implementation; no code lifted from the source.
