# Feature: Signals Hub (UC-06)

Issue: #10 · UC-06
Owner: Claude (mathursan@gmail.com)
Milestone: M2 — Cross-universe signals

## Customer
Trader opens the app with no specific universe in mind and wants to answer "what's hot / what's cold right now across everything I follow?" in under ten seconds. The Signals Hub is the single cross-universe landing view that surfaces the highest-scoring buys, lowest-scoring sells, biggest price movers, and a band-distribution heatmap — all from one click on the `Signals Hub` tool tab.

## Outcome

### Layout
- Route: `/signals-hub` (existing tool tab, `plannedIssue: 10` in `src/lib/nav.ts`).
- Page header: `h1` "Signals Hub" + one-sentence lede.
- **Universe summary strip** — one compact card per universe-backed tab in `TABS` (14 entries today; `portfolio-etfs` is in the `Universe` type but not yet wired as a tab). Card shows: label · avg composite · `🟢 N` (count with signal ∈ {Strong Buy, Buy}) / `🔴 N` (count with signal ∈ {Strong Sell, Sell}) · `N total`. Counts match the Top Buys / Top Sells filters one panel below. Universes without a snapshot render as a dimmed placeholder card ("No data yet · will populate after pipeline run"). Each populated card is a `<Link>` to the universe's screener (`/{slug}`).
- **View-mode tabs** — four segmented buttons: `Top Buys`, `Top Sells`, `Momentum`, `Heatmap`. URL-backed via `?view=`. Default `top-buys`. Matches the screener's chip-row / search URL-as-state pattern.
- **Content panel** — driven by the selected view:
  - `Top Buys` · 12 spotlight cards, cross-universe, signal ∈ {Strong Buy, Buy}, sorted by `compositeScore` desc, tie-break by `1M%` desc.
  - `Top Sells` · 12 spotlight cards, signal ∈ {Strong Sell, Sell}, sorted by `compositeScore` asc, tie-break by `1M%` asc.
  - `Momentum` · 12 spotlight cards, any signal, sorted by `|perfOneMonth|` desc.
  - `Heatmap` · grid with universe rows × signal-band columns (`Strong Sell | Sell | Neutral | Buy | Strong Buy`). Each cell = count of instruments in that band for that universe, background color from the band. Zero-count cells dim.

### Spotlight card (reused across 3 views)
- Ticker + name (truncated)
- Composite score (color-graded, same tokens as screener)
- Signal badge (same component as screener)
- Universe tag (small chip, e.g. "sector-etfs")
- `1M %` chip (color-graded)
- Click / Enter opens the existing `TickerDetailModal` (UC-05).

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | `/signals-hub` renders the universe strip, view-mode tabs, and content panel in that vertical order. |
| R2 | Universe strip shows one card per `TABS` entry with `universe != null` (14 today; max 15 when portfolio-etfs lands). Populated cards link to `/{slug}`; empty cards are non-interactive. |
| R3 | View-mode tab selection is URL-backed via `?view=top-buys|top-sells|momentum|heatmap`. Default `top-buys`. Deep link `/signals-hub?view=heatmap` renders Heatmap on first paint. |
| R4 | `Top Buys` shows at most 12 spotlight cards, only signal ∈ {Strong Buy, Buy}, sorted by composite desc. |
| R5 | `Top Sells` shows at most 12 spotlight cards, only signal ∈ {Strong Sell, Sell}, sorted by composite asc. |
| R6 | `Momentum` shows at most 12 spotlight cards, any signal, sorted by `|perfOneMonth|` desc. Null/missing `perfOneMonth` excluded. |
| R7 | `Heatmap` renders an N × 5 grid (one row per universe-backed tab, one column per band). Cell shows count + colored background; zero cells dim. |
| R8 | Clicking (or Enter on) a spotlight card opens the existing `TickerDetailModal` with that instrument loaded. Esc / backdrop / X closes. |
| R9 | Aggregation is derived from whatever snapshots exist in `public/data/`. No hardcoded instrument list. If zero snapshots exist, the content panel shows "No snapshots published yet". |
| R10 | `pnpm lint / typecheck / test / test:e2e / build / pytest` all green. |

## Out of scope
- Search within Signals Hub (already covered by universe screeners).
- Weight-preset integration (lands with UC-11).
- Sector facets on the spotlight cards (requires per-instrument sector metadata that the current snapshots don't carry).
- Historical "changed since yesterday" callouts (that's UC-07 Signal Change).

## Data
- Aggregator: pure function `aggregateSignalsHub(snapshots)` in `src/domain/signals-hub.ts`. Input: array of `UniverseSnapshot | null` (null for missing). Output: `{ universeSummaries: UniverseSummaryCard[], topBuys: SpotlightCardVM[], topSells: SpotlightCardVM[], momentum: SpotlightCardVM[], heatmap: HeatmapRow[] }`.
- Loader: `loadAllSnapshots()` in `src/lib/snapshots.ts` — reads every universe slug in `TABS`, returns an array of `{ universe, snapshot: UniverseSnapshot | null }`. Wrapped in `React.cache`.
- E2E seed extension: `scripts/seed-e2e-data.mjs` now also writes compact fixtures for `sector-etfs`, `commodities`, `india`, `europe` so the Hub can demonstrate cross-universe behavior in tests.

## Non-goals (hard)
- No client-side aggregation or live fetch. Everything reads from `public/data/*.json` at request time on the server.
- No mutation UI (no "favorite this ticker", no portfolio add from the Hub in this PR — that's UC-08 / UC-09).
