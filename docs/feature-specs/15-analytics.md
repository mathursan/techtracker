# Feature: Analytics charts (UC-10)

Issue: #15 · UC-10
Owner: Claude (mathursan@gmail.com)
Milestone: M4 — Analytics

## Customer
A trader scanning the dashboard wants a 10-second read of the current stock universe as a whole: how is the market partitioned across signals, which sectors are averaging strongest, and where does the bulk of the composite-score distribution sit. The Analytics tab answers these three questions with one chart each.

## Outcome

### Route
`/analytics` — existing tool tab (`plannedIssue: 15` in `src/lib/nav.ts`).

### Data source
Top 50 Stocks snapshot (`public/data/stocks.json`). No universe picker for MVP — matches the source. When the snapshot is missing, the page renders a "No data published yet" empty state.

### Charts (all Recharts)
1. **Signal Distribution** — vertical bar chart. x-axis: the 5 signals in severity order (Strong Sell → Strong Buy). y-axis: count. Bars colored by band.
2. **Sector Average Score** — horizontal bar chart. One row per sector present in the snapshot (`tag` → `filter.label` mapping). x-axis 0–10. Bars colored by score tone. Sorted by average score desc.
3. **Score Distribution Histogram** — vertical bar chart. 10 buckets `0–1, 1–2, …, 9–10`. y-axis: count. Bars colored by which band the bucket falls into.

### Layout
- Header: `h1 "Analytics"` + one-sentence lede referencing the universe + `asOf`.
- Three cards stacked (or 2-col at `lg`): Signal Distribution · Sector Average · Score Histogram. Each card has its own title + the chart.
- Active-preset banner renders at the top of the page when a non-default weight preset is active, and the charts use `useEffectiveInstruments` so counts / averages / histogram reflect the active preset. Same phase-1 pattern established in UC-11.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | `/analytics` renders the 3 charts over the stocks snapshot, stacked or responsive-grid. |
| R2 | Each chart uses Recharts with `ResponsiveContainer`. |
| R3 | Signal Distribution counts match the snapshot; every signal that has ≥1 instrument appears. |
| R4 | Sector Average Score averages are rounded to 1 dp, sorted desc, and sector labels match UC-02 chip labels. |
| R5 | Score histogram has 10 buckets; the last bucket is inclusive on the right (9–10 includes a perfect 10). |
| R6 | Charts respect the active weight preset — switching Methodology to Momentum Focus updates the 3 charts. |
| R7 | Empty state when stocks snapshot is missing: "No data published yet". |
| R8 | `pnpm lint / typecheck / test / test:e2e / build / pytest` all green. |

## Out of scope
- Universe picker (single-universe Analytics matches the source).
- Time-series analytics (`/signal-change` covers change-over-time).
- Interactive crosshair / tooltip beyond Recharts defaults.
- Mobile redesign beyond the default responsive grid.

## Non-goals (hard)
- No backtesting, no return / risk metrics.
- No cross-universe aggregation (out of scope even on the Signals Hub).
