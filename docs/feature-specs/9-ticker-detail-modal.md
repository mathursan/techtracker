# Feature: Ticker Detail Modal (UC-05)

Issue: #9 · UC-05
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer
Trader scanning a screener sees a row that interests them and wants a drilldown without leaving the dashboard. One click opens a centered modal with every scored indicator, the composite, the signal, perf chips, and a chart.

## Outcome
- Click any row on any screener → modal opens centered with the instrument's data.
- Header: ticker + company name (sector slot reserved for when scoring populates it) + score badge + signal badge + price + 1M / 3M / 1Y perf chips.
- Timeframe tabs: `1M | 3M | 6M | 1Y | 2Y | 5Y`. The current `sparkline` on the snapshot is ~60 daily closes (≈3 months) — timeframes longer than 3M render the same sparkline with a "showing available data" note. Per-timeframe history lands in a follow-up when the pipeline publishes per-ticker history.
- Chart-kind tabs: `Price | RSI | MACD | Bollinger | Stochastic | Volume | Radar`. `Price` and `Radar` render in this PR with available data; the other four render an explicit placeholder pointing at a follow-up issue for per-timeframe history.
- Indicator Scores panel: 9 horizontal bars (indicator name, value 0-10, weight %). Weights read from `DEFAULT_WEIGHTS`; wire to the active preset once UC-11 ships.
- Legend: `0 Strong Sell | 5 Neutral | 10 Strong Buy`.
- Close via `Esc`, backdrop click, or the `×` button. Focus returns to the trigger row.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | Clicking any screener row opens the modal for that instrument. |
| R2 | Modal uses Radix Dialog (focus-trapped, Esc closes, backdrop closes). |
| R3 | Default state: `1Y` timeframe selected, `Price` chart selected. |
| R4 | `Price` tab renders the snapshot's `sparkline` via Recharts LineChart. |
| R5 | `Radar` tab renders the 9 indicator scores via Recharts RadarChart on a 0-10 axis. |
| R6 | `RSI | MACD | Bollinger | Stochastic | Volume` tabs render an explicit "per-timeframe history ships in follow-up" placeholder, NOT a broken empty chart. |
| R7 | Indicator Scores panel lists all 9 indicators in canonical order (`INDICATOR_IDS`) with score, weight %, and a visual bar. |
| R8 | Trader-readable copy: signal badge uses the same color tokens as the screener; no advice copy. |
| R9 | Clicking a row on any universe's screener opens the modal (seeded snapshot lives on `/stocks`; clicks on empty tabs do nothing). |
| R10 | `pnpm lint / typecheck / test / test:e2e / build / pytest` all green. |

## Out of scope
- Per-timeframe history (new optional `history` field on `Instrument`).
- Weight-preset integration (wire to UC-11 state once shipped).
- Sector display (until scoring populates `Instrument.sector`).
- Mobile bottom-sheet variant (desktop-first; responsive at `sm` breakpoint but not a full redesign).
