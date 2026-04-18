---
id: UC-09
title: Build a custom portfolio by adding assets
actor: Guest
priority: P1
category: Portfolio
labels: ["feature", "portfolio-builder", "P1"]
related_use_cases: [UC-08]
screenshots:
  - docs/replicate/screenshots/tab_portfolio_builder.png
---

## Summary
Inside Portfolio Builder, a side-panel portfolio summary + a table of candidate assets (UCITS etc.) with a `+` action per row.

## Flow
1. User is on Portfolio Builder.
2. User optionally selects an asset-class filter chip: `All | Commodity | Equity | Fixed Income | Real Assets`.
3. User searches / scrolls the table.
4. User clicks `+` on a row → asset added to the portfolio panel with a weight (initial: equal-weight rebalance).
5. User can switch weighting mode (`Equal` is the observed mode; custom weights is a logical extension).
6. Portfolio panel updates `SCORE`, `WEIGHT`, `HOLDINGS (N)` live.
7. User can remove holdings (likely via the panel — inferred; not observed in captured states).
8. Portfolio state persists to `localStorage` (so `0/5 saved` is expected for saved **slots** — inferred).

## Acceptance criteria
- [ ] `+` button adds the instrument to the portfolio.
- [ ] Adding rebalances weights (equal mode) so sum = 100%.
- [ ] Composite score = weighted average of holding scores using the active weight preset.
- [ ] Portfolio panel shows a clear empty state until first add.
- [ ] Remove-holding affordance available in the panel.
- [ ] Asset-class chip filters the candidate table (intersect with search if active).
