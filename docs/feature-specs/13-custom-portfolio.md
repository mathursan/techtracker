# Feature: Portfolio Builder — build custom portfolio (UC-09)

Issue: #13 · UC-09
Owner: Claude (mathursan@gmail.com)
Milestone: M3 — Portfolio

## Customer
A trader wants to build a basket from scratch — drop in 4–12 tickers pulled from across the published universes, see the weighted composite score, and tweak it over time. On return visits the basket should still be there. No login, no server, no cloud sync — just localStorage.

## Outcome

### Layout (extends UC-08)
`/portfolio` grows a custom-portfolio layer below the preset cards:
- **Preset cards** (unchanged from UC-08, 4 of them).
- **Active portfolio panel** — either a preset panel (when `?preset=<slug>`) OR the custom panel (when URL is clean).
- **"Customize this preset →" button** on the preset panel copies its holdings into the custom store and clears `?preset`.
- **Candidate table** — below the panel. Every instrument from every published universe snapshot is a row. Asset-class chip filter + search input above. Each row has a `+` button that adds the ticker to the custom store; already-added rows show a checkmark and the button is disabled.
- **Custom panel** (when no preset selected): summary strip (SCORE / HOLDINGS count) + holdings table with `−` button per row + clear-all button. Empty state: "Click + on a candidate below, or pick a preset above."

### State
- **Client-side zustand store** `src/stores/portfolio.ts` with `persist` middleware keyed on `localStorage["tt-portfolio"]`. Shape: `{ holdings: { ticker: string }[], add, remove, replace, clear }`.
- Store loads after hydration; during SSR the custom panel renders a placeholder (same empty state copy) and swaps in the real list client-side. Matches the theme-toggle hydration pattern already in the codebase.

### Score
- Weighted mean of the resolved holdings' `compositeScore`. Equal-weight across all store holdings (each gets `100 / N %`). Identical math to UC-08's `buildPortfolioVM` — we synthesise a `PortfolioPreset`-shaped object from the store and feed it through the same aggregator. No new scoring logic.

### Asset-class filter chips
`All | Equity | Commodity | Fixed Income | FX`. Per-universe mapping in `src/domain/asset-class.ts`:
- `stocks / india / hong-kong / singapore / japan / europe` → Equity
- `sector-etfs / industry-etfs / country-etfs / broad-market / growth-value / portfolio-etfs` → Equity (ETFs are equity-backed)
- `commodities` → Commodity
- `fixed-income` → Fixed Income
- `currencies` → FX

"Real Assets" (from the source) folds into Commodity for MVP — our commodity seed already covers gold / silver / oil / copper / natural gas / corn.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | Candidate table lists every instrument from published universe snapshots. One row per ticker (no duplicates). |
| R2 | Asset-class chip filter scopes the candidate table. Default `All`. |
| R3 | Search input (ticker OR name, case-insensitive) filters the candidate table. Intersects with chip filter. |
| R4 | Clicking `+` on a candidate row adds the ticker to the custom portfolio store. Row shows a checkmark and the button disables. |
| R5 | Custom panel shows SCORE (weighted mean), HOLDINGS (N), and a row per holding with a `−` remove button and a `Clear all` button. |
| R6 | Portfolio state persists across reloads via `localStorage["tt-portfolio"]`. |
| R7 | Clicking a preset card LOADS that preset's holdings into the custom store **and** navigates to `?preset=<slug>`. Clicking "Customize →" on the preset panel copies the holdings to the store and clears the URL param, entering custom mode. |
| R8 | Custom panel empty state: "Click + on a candidate below, or pick a preset above." |
| R9 | Row click (on candidate OR custom panel holding) opens the UC-05 detail modal. |
| R10 | `pnpm lint / typecheck / test / test:e2e / build / pytest` all green. |

## Out of scope
- Named / saved custom portfolios (the "0/5 saved" slot UI from the source). MVP is one active custom portfolio per browser.
- Custom per-holding weights (equal-weight only).
- Cross-device sync (no auth, no backend).
- Portfolio CSV export / share link (no URL-state for custom — too many tickers to pack into a query string cleanly).
- Backtesting / return / risk metrics (non-goal in architecture §1).

## Non-goals (hard)
- No server-side writes. No auth. No mutation API. Everything the user does lives in their own browser.
