# Feature: Chip Filter (UC-02)

Issue: #5 · UC-02
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer
Trader scanning a universe wants to zero in on a sector or facet — "show me just Financials in Top 50", "just Precious Metals in Commodities". Source app uses a single-select chip row above the table.

## Outcome
- A chip row renders above the screener with one chip per `summary.filters` entry.
- `All` is always active by default; clicking any chip narrows instruments whose `tags` array contains that chip's `key`.
- KPI cards recompute against the filtered set (`Showing 12 / 50`, avg reflects the filtered avg).
- Selected chip persists in the URL (`?chip=tech`) so back/forward + shared links round-trip.
- Switching tabs resets chip to `all`.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | SHALL render a chip row above the ScreenerTable, sourced from `snapshot.summary.filters`. |
| R2 | SHALL be single-select; one chip is active at any time. Default is `all`. |
| R3 | SHALL read/write the selected chip to the URL via `?chip=<key>`. Missing / unknown param defaults to `all`. |
| R4 | SHALL filter instruments: `All` returns everything; any other chip returns instruments where `instrument.tags.includes(chipKey)`. |
| R5 | KPI cards SHALL recompute against the filtered set: `Avg Score` averaged over filtered rows, `Strong Buy` / `Strong Sell` counts over filtered rows, `Showing N / M` where N is filtered count and M is universe total. |
| R6 | SHALL preserve the active chip during sort (#7) and tab switches within the same universe. Different universe = chip resets. |
| R7 | SHALL render a clear empty state when the chip narrows to 0 rows ("No matches for this filter"). |
| R8 | Instruments SHALL carry an optional `tags: string[]` field on the domain model; the scoring pipeline's Instrument type adds it as an optional. Real snapshots populate it over time (scoring pipeline follow-up). |
| R9 | SHALL NOT regress previous tests. |

## Out of scope
- Chips on tool tabs (portfolio/signals-hub/etc.) — not applicable.
- Multi-select chips (single-select matches source).
- Populating `tags` in the real scoring pipeline — tracked as follow-up once a universe's sector mapping is maintained server-side.
