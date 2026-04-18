# TechTracker

A close replica of [st-technical-analysis.lovable.app](https://st-technical-analysis.lovable.app) — a technical-analysis dashboard that scores global markets (US equities, sector/industry/country ETFs, currencies, commodities, India/HK/SG/JP/Europe equities, fixed income, broad market and growth/value funds) across 9 indicators.

This repo currently contains the replication analysis package (`docs/replicate/`). Implementation follows the roadmap in [`docs/replicate/IMPLEMENTATION_ROADMAP.md`](docs/replicate/IMPLEMENTATION_ROADMAP.md).

## Start here
- [`docs/replicate/REPLICATION_ANALYSIS.md`](docs/replicate/REPLICATION_ANALYSIS.md) — master report
- [`docs/replicate/INDEX.md`](docs/replicate/INDEX.md) — quick navigation
- [`docs/replicate/IMPLEMENTATION_ROADMAP.md`](docs/replicate/IMPLEMENTATION_ROADMAP.md) — phased plan + milestones
- GitHub issues — one per use case

## Target stack
Next.js 15 · React 19 · TypeScript · Tailwind 4 · shadcn/ui · Recharts · TanStack Table/Query · Zustand · Python scoring pipeline via GitHub Actions · Vercel.

## License
MIT — see [`LICENSE`](LICENSE). Replica implementation; no code lifted from the source.
