# TechTracker Replication Analysis

**Source:** https://st-technical-analysis.lovable.app
**Captured:** 2026-04-18
**Fidelity goal:** close clone; UX deviations allowed when sensible
**Target repo:** new GitHub repository (to be created in phase 10)

## Executive summary

TechTracker is a **technical-analysis dashboard** for global markets. A single SPA screens 15 asset universes (US equities, sector/industry/country ETFs, currencies, commodities, India, Hong Kong, Singapore, Japan, Europe, fixed income, broad-market funds, growth/value funds, plus a "Portfolio ETFs" universe surfaced in Signals Hub), scoring every instrument 0–10 across **9 technical indicators** (MA Trend, MACD, RSI, ADX/DMI, SAR, Bollinger, Stochastic, OBV, Ichimoku). A **weighted composite score** is mapped to a 5-level **signal** (Strong Buy / Buy / Neutral / Sell / Strong Sell). The UI layers additional views on top: cross-universe **Signals Hub**, **Signal Change** (upgrades/downgrades 1W / 1M), a **Portfolio Builder** (4 preset macro regime portfolios + custom), summary **Analytics** charts, and a transparent **Methodology** tab where users can tune indicator weights.

No authentication. No server API observed. Data is produced by an offline Python pipeline referenced on the Methodology tab (`python sp500_technical_framework.py [--all|--etfs|--industry-etfs|--country-etfs]`) and consumed client-side by the React SPA.

## Technology stack

See [`reports/technology-stack.md`](./reports/technology-stack.md) for evidence-based classification of the source stack and [`reports/tech-stack.md`](./reports/tech-stack.md) for the replica stack decision.

**Source (observed):** React 18, Vite, Tailwind, Radix UI (via shadcn), Recharts, lucide-react v0.462.0, hosted on Cloudflare/Lovable. Offline Python scoring pipeline.

**Replica (decided):** Next.js 15 (App Router) + TypeScript strict, Tailwind 4 + shadcn/ui, Recharts, TanStack Table, TanStack Query, Zustand. Python scoring package run via GitHub Actions cron, publishing per-universe JSON snapshots under `/public/data/`. Deployed to Vercel.

## User roles

Only one actor: **Guest (anonymous user)**. No login, no server-persisted user data. Local-only persistence via `localStorage` for theme, active weight preset, saved custom weight presets (up to 5), and user portfolio holdings.

One implicit service actor: the **Scoring Pipeline** (UC-15) — the scheduled job that publishes per-universe JSON snapshots.

## Use case summary

| Priority | Count | Use cases |
|---|---|---|
| P0 | 6 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-14, UC-15 |
| P1 | 5 | UC-06, UC-07, UC-08, UC-09, UC-13 |
| P2 | 3 | UC-10, UC-11, UC-12 |

| Category | Count | Use cases |
|---|---|---|
| Screener | 4 | UC-01, UC-02, UC-03, UC-04 |
| Detail | 1 | UC-05 |
| Signals | 2 | UC-06, UC-07 |
| Portfolio | 2 | UC-08, UC-09 |
| Analytics | 1 | UC-10 |
| Methodology | 1 | UC-11 |
| Shell | 3 | UC-12, UC-13, UC-14 |
| Backend | 1 | UC-15 |

Full master list in [`reports/use-cases.md`](./reports/use-cases.md). One file per use case under [`analysis/`](./analysis/).

## Component inventory

See [`reports/component-catalog.md`](./reports/component-catalog.md). Key primitives:

- `AppHeader`, `TabBar`, `StatusLine`
- `StatCard`, `UniverseStatCard`, `SignalChangeCard`, `TickerSpotlightCard`
- `ScreenerTable`, `TrendSparkline`, `SignalBadge`, `IndicatorScoreCell`
- `SearchInput`, `FilterChip`, `LookbackToggle`, `WeightPresetChips`, `WeightSlider`
- `ModelPortfolioCard`, `PortfolioPanel`, `AddAssetButton`
- `TickerDetailModal` (with `TimeframeTabs`, `ChartKindTabs`, `IndicatorScoresPanel`)
- Analytics charts: `SignalDistributionBarChart`, `SectorAverageScoreBarChart`, `ScoreDistributionHistogram`

## Data models

See [`reports/data-models.md`](./reports/data-models.md). Core entities:

- `Instrument` — ticker row as displayed in the screener.
- `UniverseSummary` — aggregates for Signals Hub & Signal Change.
- `ScoringConfig` + `WeightPreset` — methodology state.
- `UserPortfolio` + `ModelPortfolio` + `PortfolioHolding` — Portfolio Builder state.
- `SignalChange` — per-ticker delta between lookback and now.
- `TickerDetail` + `PricePoint` + `IndicatorSeries` — detail modal payloads.
- `ScoreSnapshot` — the JSON envelope emitted by the scoring pipeline (one per universe).

## Implementation recommendations

Phased build mirroring priority:

1. **Scaffolding (P0 foundations)** — Next.js + Tailwind + shadcn + theme toggle + tab bar + URL routing + empty universe screen. (UC-14, UC-12)
2. **Scoring pipeline skeleton (P0)** — Python package with one indicator working end-to-end (MA Trend), publishing a snapshot for Top 50 Stocks. GitHub Actions scheduled. (UC-15)
3. **Screener table (P0)** — `ScreenerTable`, `SignalBadge`, `IndicatorScoreCell`, `TrendSparkline`, KPI cards, filter chips, search, sort. Feed from snapshot. (UC-01, UC-02, UC-03, UC-04, UC-13)
4. **All 9 indicators + 15 universes (P0)** — expand scoring + ticker lists. Publish full set of snapshots.
5. **Ticker detail modal (P0)** — `TickerDetailModal` + timeframe/chart tabs + Recharts integration. (UC-05)
6. **Cross-universe views (P1)** — Signals Hub (UC-06), Signal Change with historical snapshots (UC-07).
7. **Portfolio Builder (P1)** — model portfolios + custom builder + localStorage persistence. (UC-08, UC-09)
8. **Methodology & custom weights (P2)** — presets + sliders + save up to 5. (UC-11)
9. **Analytics (P2)** — three summary charts. (UC-10)
10. **Polish** — responsive passes, a11y audit, visual regression snapshots against the source screenshots in `docs/replicate/screenshots/`.

### Open questions to track in issues

- Does the source auto-refresh on a timer, or is it a hard reload only? (UC-13)
- Is the theme toggle truly stateful? In our session it didn't visibly flip — worth confirming with a fresh browser session. (UC-12)
- Analytics — is there a universe picker we missed, or is it always Top 50? (UC-10)
- Portfolio Builder — is the remove-holding affordance in-panel or via a second `+`/`−` toggle on the table? (UC-09)

## Next steps

Move to **Phase 8: prepare-issue-generation** of `application-replication-workflow`. Each use case above becomes a GitHub issue, labeled by priority and category, filed into a new repository on the operator's GitHub account.
