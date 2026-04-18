---
id: UC-04
title: Sort the screener by any column
actor: Guest
priority: P0
category: Screener
labels: ["feature", "screener", "sort", "P0"]
related_use_cases: [UC-01]
---

## Summary
Every column (except the `Trend` sparkline) is sortable. Clicking a header toggles the sort direction.

## Flow
1. User clicks a sortable column header (e.g. `1M %`).
2. First click sorts descending by default for numeric/percent columns; ascending for `Ticker` / `Name`.
3. Second click toggles direction.
4. Only one column is the active sort at a time.

## Acceptance criteria
- [ ] All columns sortable except `Trend` (sparkline).
- [ ] Sort carets render in the header icon slot.
- [ ] Signal column sorts by severity (Strong Buy > Buy > Neutral > Sell > Strong Sell).
- [ ] Sort persists during chip filter and search.
