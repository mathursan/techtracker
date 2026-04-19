# Feature: Portfolio Builder — preset model portfolios (UC-08)

Issue: #12 · UC-08
Owner: Claude (mathursan@gmail.com)
Milestone: M3 — Portfolio

## Customer
A trader wants to see "what would a Stagflation Hedge portfolio look like right now, using my own technical scoring?" They don't want to hand-enter seven tickers. They want one click on a macro-regime card to populate the portfolio panel with a pre-curated holdings list, then read the weighted composite score at a glance.

## Outcome

### Layout
- Route: `/portfolio` (existing tool tab, `plannedIssue: 12` in `src/lib/nav.ts`).
- Page header: `h1 "Portfolio Builder"` + one-sentence lede.
- **Preset cards row** — 4 clickable cards, one per macro regime:
  1. 🔄 **Late Cycle Expansion** — Quality equity, defensive sectors, gold.
  2. 🔥 **Stagflation Hedge** — Hard assets, commodities, inflation protection.
  3. 🛡️ **Risk-Off / Recession** — Gold, staples, utilities, min-vol equity.
  4. 🚀 **Reflation / Commodity Bull** — Recovery + inflation broad equity + EM + commodities.

  Bond-sleeve wording ("short duration", "quality bonds") is out of the
  thesis copy until the `fixed-income` universe seeds. Once it ships the
  baskets can re-add a bond proxy and the copy can promise what's on the
  plate.
  Each card shows emoji, name, one-line thesis, and `N assets`. Active preset visually highlighted.
- **Portfolio panel** — active-preset holdings. Summary strip with `SCORE · WEIGHT · HOLDINGS (N)`. Table columns: `Ticker · Name · Universe · Signal · Score · Weight %`.
- **Empty state** — before any preset is chosen, "Pick a preset to load a model portfolio" with a pointer to UC-09 for custom.

### State
- URL-backed via `?preset=<slug>` where slug is `late-cycle | stagflation | risk-off | reflation`. Default: none selected.
- No local mutation in UC-08. Custom edits land in UC-09.

### Score
- Portfolio `SCORE` = `sum(weight_i × score_i) / sum(weight_i)` over the resolved holdings. Holdings without a published score (missing from all snapshots) are **excluded from the score** but still listed in the table with a `—` cell, so the panel doesn't silently hide an unresolved ticker.
- Default weights are equal-weight across all holdings in the preset. "Prescribed" weights are supported via the `weight` field on each holding — preset config is the source of truth. Equal-weight is chosen when holdings omit `weight`.

### Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | `/portfolio` renders header, 4 preset cards, and portfolio panel below. |
| R2 | Clicking a card sets `?preset=<slug>` and loads that preset's holdings. Active card is highlighted. |
| R3 | Deep link `/portfolio?preset=stagflation` loads Stagflation Hedge on first paint. |
| R4 | Portfolio SCORE is the weighted mean of the resolved holdings' `compositeScore`, weighted by holding `weight` (equal-weighted when `weight` omitted). |
| R5 | Holdings table shows one row per holding. Each row displays ticker, name, universe, signal badge, score, weight %. Missing holdings render `—` in name/universe/signal/score cells and don't contribute to SCORE. |
| R6 | Row click opens the existing `TickerDetailModal` (UC-05) for that instrument. Missing holdings are non-clickable. |
| R7 | Invalid or missing `?preset` value: defaults to "no preset selected" view; never renders a broken state. |
| R8 | `pnpm lint / typecheck / test / test:e2e / build / pytest` all green. |

## Out of scope
- User-edited custom portfolios (UC-09).
- Portfolio saving / persistence across sessions (no auth).
- Weight-preset (UC-11) wiring — portfolio SCORE uses each instrument's `compositeScore` as-is; that already derives from `DEFAULT_WEIGHTS` until UC-11 ships.
- Rebalance UI / trade sizing (brokerage-side, non-goal in architecture §1).
- Mobile bottom-sheet layout — desktop-first.

## Data
- **Preset config** — `src/domain/portfolio-presets.ts` holds the 4 presets as static `PortfolioPreset[]`. Each preset has `slug`, `emoji`, `name`, `thesis`, and `holdings: { ticker, weight? }[]`. Holdings resolve against any published universe snapshot via `findInstrumentByTicker()` so presets don't need to know which universe an instrument lives in.
- **Resolver** — `findInstrumentByTicker(ticker, snapshots)` walks the published snapshots and returns the first match. If a ticker appears in multiple universes, first-match wins (explicit, deterministic order).
- **Aggregator** — `buildPortfolioVM(preset, snapshots)` in `src/domain/portfolio.ts`. Pure. Returns `{ resolved, unresolved, score, totalWeight, holdings }` where `holdings` is the full rendered-order list (resolved first, unresolved after).

## Non-goals (hard)
- No trade execution, brokerage, or cash management.
- No return/risk/Sharpe calculations. SCORE is the only composite shown.
- No explicit backtesting. Portfolio SCORE is a point-in-time view.
