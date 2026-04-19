# Feature: Screener Search (UC-03)

Issue: #6 · UC-03
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer
Trader wants to type `nvda` and see only NVIDIA in a 73-row Europe screener, or type `bank` and see every ticker with "Bank" in the name. Fast, in-table, no page reload.

## Outcome
- Search input above the screener filters instruments by case-insensitive substring match against `ticker` OR `name`.
- Combines with chip filter via intersection (chip narrows first, search then narrows further).
- URL-stateful: `?q=nvda` round-trips.
- Typing shows results inline with ~150ms debounce; empty query = no filter.
- Empty result set (chip + search together produce zero rows) shows a clear "No matches" message.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | SHALL render a single text input ("Search ticker or name…") above the ScreenerTable. |
| R2 | SHALL match instruments where `ticker` or `name` contains the query (case-insensitive). |
| R3 | SHALL intersect with the chip filter (chip applies first, then search). |
| R4 | SHALL write the query to the URL (`?q=<query>`), updating as the user types (debounced ~150ms). |
| R5 | SHALL read `?q=` from URL on initial render so deep-linked searches work. |
| R6 | SHALL preserve the chip (`?chip=`) while updating the query, and vice versa. |
| R7 | SHALL show an empty state ("No matches. Try clearing the search or filter.") when chip × search yields 0 rows. |
| R8 | KPI cards SHALL recompute against the chip × search intersection. |
| R9 | SHALL NOT regress existing tests. |
| R10 | Empty query / whitespace-only query SHALL be treated as no-filter. |

## Out of scope
- Highlighting matched substring.
- Search across other fields (sector, country).
- Fuzzy matching.
