# Replication Package Index

Quick navigation for the TechTracker replication artifacts.

## Top-level
- [REPLICATION_ANALYSIS.md](./REPLICATION_ANALYSIS.md) — master report
- [INDEX.md](./INDEX.md) — this file

## Reports
- [use-cases.md](./reports/use-cases.md)
- [component-catalog.md](./reports/component-catalog.md)
- [layout-patterns.md](./reports/layout-patterns.md)
- [technology-stack.md](./reports/technology-stack.md) — evidence-based classification of source stack
- [tech-stack.md](./reports/tech-stack.md) — replica stack decision + rationale
- [data-models.md](./reports/data-models.md)
- [screenshot-index.md](./reports/screenshot-index.md)

## Use cases (one file each)
- [UC-01 Browse a universe in the screener](./analysis/uc-01-screener-view.md) — P0
- [UC-02 Filter the screener by chip](./analysis/uc-02-filter-chip.md) — P0
- [UC-03 Search within a universe](./analysis/uc-03-search.md) — P0
- [UC-04 Sort the screener](./analysis/uc-04-sort.md) — P0
- [UC-05 Ticker detail modal](./analysis/uc-05-ticker-detail.md) — P0
- [UC-06 Signals Hub](./analysis/uc-06-signals-hub.md) — P1
- [UC-07 Signal Change](./analysis/uc-07-signal-change.md) — P1
- [UC-08 Load preset model portfolio](./analysis/uc-08-portfolio-preset.md) — P1
- [UC-09 Build custom portfolio](./analysis/uc-09-portfolio-custom.md) — P1
- [UC-10 Analytics charts](./analysis/uc-10-analytics.md) — P2
- [UC-11 Methodology & weight presets](./analysis/uc-11-methodology-weights.md) — P2
- [UC-12 Theme toggle](./analysis/uc-12-theme.md) — P2
- [UC-13 Data freshness](./analysis/uc-13-data-freshness.md) — P1
- [UC-14 App shell & tab nav](./analysis/uc-14-app-shell.md) — P0
- [UC-15 Scoring pipeline](./analysis/uc-15-scoring-pipeline.md) — P0

## Screenshots
- Primary: `screenshots/home_fullpage.png`, `screenshots/tab_*.png`, `screenshots/detail_amd_modal.png`
- Raw exploration captures: `artifacts/screenshots/` (≈50 PNGs)

## Raw artifacts
- `artifacts/site_analysis.json` — initial static scrape
- `artifacts/interaction_analysis.json` — Playwright interactive walk
- `artifacts/comprehensive_analysis.json` — route probing
- `artifacts/home_snapshot.yml` — full accessibility snapshot of homepage
- `artifacts/tabs/screener_tabs.json` — structured per-tab capture (columns, chips, sample rows, row counts)

## Statistics

| Metric | Value |
|---|---|
| Tabs cataloged | 19 |
| Universes with scoring data | 15 (13 visible as tabs + 2 implied — "Portfolio ETFs" universe, and US Large Cap implicit in Top 50) |
| Technical indicators scored | 9 |
| Signal bands | 5 (Strong Buy / Buy / Neutral / Sell / Strong Sell) |
| Weight presets | 4 built-in + 5 user slots |
| Use cases | 15 |
| Primary-view screenshots | 14 |
| Raw exploration screenshots | ≈50 |

## Source technology (identified)
React 18 · Vite · Tailwind CSS · Radix UI · Recharts · lucide-react 0.462.0 · Cloudflare + Lovable hosting · offline Python scoring pipeline.

## Target technology (decided)
Next.js 15 App Router · React 19 · TypeScript strict · Tailwind 4 · shadcn/ui · Recharts · TanStack Table · TanStack Query · Zustand · Python scoring (GitHub Actions cron) · Vercel.
