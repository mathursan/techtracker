# Feature: Screener View (UC-01)

Issue: #4 · UC-01
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer
Self-directed trader opening the dashboard to scan a universe (stocks, sector ETFs, commodities, India, …). Wants a dense sortable table plus aggregate KPIs at the top.

## Outcome
For every universe-backed tab (11 row-1 tabs + 3 row-2 tabs = 14 universes; `portfolio-etfs` surfaces only in Signals Hub/Portfolio Builder), the screener view renders:
- 4 KPI cards (Avg Score / Strong Buy / Strong Sell / Showing N of M)
- Filter chip row placeholder (chips wired in #5)
- Search placeholder (wired in #6)
- Sortable screener table with these columns:
  - `Ticker` (symbol + name stacked)
  - `Score` (composite 0–10, color-graded)
  - `Signal` (pill badge)
  - `Price` (last close, `$X.XX`)
  - `1M %` / `3M %` (signed percent, green/red)
  - `Trend` (60-day sparkline SVG, colored by 1M direction)
  - 9 indicator cells (0–10 numeric, color-graded)
- Default sort: composite score descending.

Universe-specific extras (`AUM`, `TER`, `Country`) will be added in the follow-up when snapshot payloads carry those fields — flagged in the spec but not required for this PR. The Instrument type already has optional slots for them.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | SHALL render the screener view on all 14 screener-backed tabs (`stocks`, `sector-etfs`, `industry-etfs`, `country-etfs`, `currencies`, `commodities`, `india`, `hong-kong`, `singapore`, `japan`, `europe`, `fixed-income`, `broad-market`, `growth-value`). Tool tabs (`portfolio`, `signals-hub`, `signal-change`, `analytics`, `methodology`) keep the placeholder. |
| R2 | SHALL fetch `/data/<universe>.json` at route render time and render the instruments. |
| R3 | SHALL render KPI cards reading from `summary.avgScore`, `summary.strongBuyCount`, `summary.strongSellCount`, `summary.totalCount`. |
| R4 | SHALL render rows in composite-score descending order by default. Clicking a column header toggles sort direction on that column; the `Trend` sparkline column is not sortable. |
| R5 | SHALL apply color grading to indicator cells: ≥7 green, 4-6.9 amber, <4 red. Score cell uses the same grading. |
| R6 | SHALL render signal pills with color semantics: Strong Buy / Buy = green family, Neutral = amber, Sell / Strong Sell = red family. |
| R7 | SHALL handle empty / loading / error states — a skeleton row count while loading, "No data yet" if the snapshot is missing, and a clear error message if the fetch fails. |
| R8 | SHALL not trigger a full page reload when navigating between universe tabs. |
| R9 | SHALL preserve the app shell + tab bar + disclaimer; the screener mounts in the main content slot only. |
| R10 | SHALL keep the placeholder view on tool tabs (`portfolio`, `signals-hub`, etc.) — those UCs land in their own PRs. |
| R11 | SHALL NOT break any existing test. |

## Design standards
shadcn primitives where they fit (`Card` for KPI tiles, minimal custom for the table). Color tokens reused from `globals.css`. Lucide icons for trend up/down cues.

## Compliance
Disclaimer remains in root layout. No new PII. Score semantics presented with the signal pill verbatim — no re-interpretation.

## Validation plan
- Unit: `src/components/screener/*.test.tsx` for SignalBadge, IndicatorScoreCell colors, TrendSparkline, sort helper.
- Component: ScreenerTable with fixture snapshot renders correct counts and row values.
- E2E: seed `public/data/stocks.json` via a helper script, visit `/stocks`, confirm table renders 50 rows, sort by 1M % descending, assert top row has highest `1M %`.

## Out of scope
- Chip filter (#5).
- Search (#6).
- Virtualization (defer — 50-73 rows renders fast enough).
- Sticky headers in horizontal scroll (defer to polish pass).
- Universe-extra columns (AUM/TER/Country) — Instrument type has optional slots; surface in a follow-up PR once scoring populates them.

## Open questions
None blocking.
