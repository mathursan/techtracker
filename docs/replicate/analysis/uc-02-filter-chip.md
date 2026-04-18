---
id: UC-02
title: Filter the screener by sector/facet chip
actor: Guest
priority: P0
category: Screener
labels: ["feature", "screener", "filter", "P0"]
related_use_cases: [UC-01]
---

## Summary
A single-select pill row above each screener lets the user restrict rows to one facet (sector, region, asset style, commodity type, etc.). `All` is the default.

## Flow
1. User is on any screener tab.
2. User clicks a chip (e.g. `Information Technology`).
3. Table filters to rows matching that facet.
4. KPI cards recompute against the filtered set (`Showing` ratio updates, `Avg Score` updates, strong-buy/strong-sell counts reflect the filtered set).
5. Clicking `All` clears the filter.
6. Switching tabs resets the chip to `All`.

## Acceptance criteria
- [ ] Chip selection is single-select within a row (visually highlighted).
- [ ] `All` returns to the full list.
- [ ] KPI cards recompute on filter change.
- [ ] Active chip persists during sort + search.
- [ ] Chip sets differ per universe — see the table in UC-01.
