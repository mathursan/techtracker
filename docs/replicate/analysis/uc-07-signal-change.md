---
id: UC-07
title: View Signal Change (upgrades / downgrades, 1W / 1M)
actor: Guest
priority: P1
category: Signals
labels: ["feature", "signal-change", "P1"]
related_use_cases: [UC-05, UC-15]
screenshots:
  - docs/replicate/screenshots/tab_signal_change.png
---

## Summary
Shows where signals moved between the selected lookback (1 Week / 1 Month) and now. Aggregates across all 15 universes.

## Flow
1. User clicks `Signal Change`.
2. Lookback toggle: `1 Week | 1 Month` (default 1 Month).
3. 16 summary cards: `All Markets` + per-universe, each with total count + ⬆ upgrades / ⬇ downgrades.
4. Sub-filter: `🔄 All Changes | ⬆ Upgrades | ⬇ Downgrades`.
5. Table renders rows with columns: `Ticker | Name | Universe | Previous Signal | → | Current Signal | Score | 1M Chg`.
6. Row click opens UC-05 detail modal.

## Acceptance criteria
- [ ] Scoring pipeline must store a historical snapshot at least as old as the longest lookback (1 Month). See UC-15.
- [ ] Lookback toggle refetches/recomputes counts and rows.
- [ ] Sub-filter scopes the table (upgrades only / downgrades only / all).
- [ ] Universe summary card click scopes the table to that universe.
- [ ] Score column shows current score + current signal pill.
