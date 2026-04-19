# Feature: Signal Change (UC-07)

Issue: #11 · UC-07
Owner: Claude (mathursan@gmail.com)
Milestone: M2 — Cross-universe signals

## Customer
A trader who checked the screener yesterday (or last week) wants to know only what *changed* since then — who got upgraded to Buy / Strong Buy, who got downgraded to Sell / Strong Sell. They don't want to re-scan 500 rows. They want the delta list.

## Outcome

### Layout
- Route: `/signal-change` (existing tool tab, `plannedIssue: 11` in `src/lib/nav.ts`).
- Page header: `h1 "Signal Change"` + lede describing the lookback window.
- **Lookback toggle** — two segmented buttons: `1 Week`, `1 Month`. Default `1 Month`. URL-backed `?lookback=1w|1m`.
- **Universe strip** — compact cards, one per universe-backed tab + one "All markets" card. Each card shows `label · ⬆ N upgrades / ⬇ N downgrades`. Click a card to scope the table to that universe (URL `?u=stocks`). Click "All markets" to clear the scope.
- **Sub-filter** — three tabs: `All Changes`, `Upgrades`, `Downgrades`. URL-backed `?direction=all|up|down`, default `all`.
- **Changes table** — columns: `Ticker | Name | Universe | Prev → Now | Score | 1M %`. Rows sorted by severity jump (e.g. Sell → Strong Buy first), then by composite score desc for upgrades, asc for downgrades. Row click opens the UC-05 detail modal.

### Severity
Signal severity ladder (same as `SIGNAL_SEVERITY` in `src/domain/bands.ts`): Strong Sell=1, Sell=2, Neutral=3, Buy=4, Strong Buy=5. Upgrade = severity increased; downgrade = severity decreased. Flat (same signal) rows are hidden — "no change" is not a row.

### Empty states
- No historical snapshots available yet → show "Awaiting historical snapshots from the scoring pipeline (UC-15 dependency)". This is non-blocking; UC-15 shipped the pipeline but not yet the history-archive plumbing.
- No changes at the selected lookback → "No signal changes in the last N". Not an error.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | `/signal-change` renders header, lookback toggle, universe strip with "All markets" card, sub-filter, and the changes table. |
| R2 | Lookback toggle is URL-backed (`?lookback=1w|1m`). Default `1m`. Switching updates counts and rows. |
| R3 | Sub-filter is URL-backed (`?direction=all|up|down`). Default `all`. Scopes the table. |
| R4 | Universe scope is URL-backed (`?u=<slug>`). Clicking a universe card sets it; "All markets" clears it. |
| R5 | Table row shows `Prev → Now` with both signal badges and an arrow glyph. Direction is signal-severity derived; flat rows are not listed. |
| R6 | Row click opens the existing `TickerDetailModal` (UC-05). |
| R7 | Aggregator is a pure domain function (no I/O). Empty/missing historical snapshots → sane empty state, never throws. |
| R8 | Historical snapshot contract: `public/data/history/<universe>-<1w|1m>.json` — same `ScoreSnapshot` shape as current. Seeder emits fixtures for the same 5 universes the main seed covers so e2e has deltas to render. |
| R9 | `pnpm lint / typecheck / test / test:e2e / build / pytest` all green. |

## Out of scope
- Custom lookback windows (1D, 3M, etc.). Two lookbacks are enough for the initial landing.
- Change-since-yesterday spotlight cards on the Signals Hub (cross-feature feature; tracked separately).
- Push/email notifications for upgrades you care about. No auth, no mutations.
- Score-delta column (e.g. "+1.4 since last week"). Keep the initial columns tight; add later.

## Data
- New loader: `loadHistoricalSnapshot(universe, lookback)` in `src/lib/snapshots.ts` — reads `public/data/history/<universe>-<1w|1m>.json`. Returns null on ENOENT / parse error / shape failure. Wrapped in `React.cache`.
- Aggregator: `diffSnapshots(current, historical)` in `src/domain/signal-change.ts`. Pure; returns `{ rows: SignalChangeRow[], upgrades: number, downgrades: number }` for a single universe. `aggregateSignalChanges(currentSnaps, historicalSnaps)` composes across universes.
- Seed extension: `scripts/seed-e2e-data.mjs` emits `public/data/history/<universe>-1w.json` and `...-1m.json` for each of the 5 seeded universes. Values are tweaked deltas of the current fixture so the e2e page has predictable upgrade/downgrade counts.

## Non-goals (hard)
- No real-time diffing. Reads JSON on the server; re-renders on navigation.
- No user-chosen reference date; only the two published lookbacks.
