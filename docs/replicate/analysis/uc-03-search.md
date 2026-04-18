---
id: UC-03
title: Search within a universe by ticker or name
actor: Guest
priority: P0
category: Screener
labels: ["feature", "screener", "search", "P0"]
related_use_cases: [UC-01, UC-02]
---

## Summary
Type-ahead filter input above each screener. Matches against `ticker` and `name`, case-insensitive, substring match.

## Flow
1. User types in the `Search ticker or name...` input.
2. Table filters as the user types (client-side, debounced ~150ms).
3. KPI card `Showing` ratio updates to reflect match count.
4. Clearing the input restores the chip-filtered view.

## Acceptance criteria
- [ ] Matches `ticker` or `name`; case-insensitive.
- [ ] Works simultaneously with chip filter (intersection).
- [ ] Empty state shown when no matches.
- [ ] Search value scoped per tab (switching tabs clears it).
