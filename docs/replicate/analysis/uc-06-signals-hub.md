---
id: UC-06
title: View Signals Hub (Top Buys / Top Sells / Momentum / Heatmap)
actor: Guest
priority: P1
category: Signals
labels: ["feature", "signals-hub", "P1"]
related_use_cases: [UC-01, UC-05]
screenshots:
  - docs/replicate/screenshots/tab_signals_hub.png
---

## Summary
Cross-universe digest view. At the top, 15 universe summary cards. Below, 4 view modes: `Top Buys`, `Top Sells`, `Momentum`, `Heatmap`. Each view renders spotlight cards or a grid of signals from every universe.

## Flow
1. User clicks `Signals Hub`.
2. App aggregates all 15 snapshots.
3. 15 summary cards render: universe name, avg score, `🟢 N / 🔴 N`, `N total`.
4. User picks a view:
   - **🟢 Top Buys** — top N scores where signal ∈ {Strong Buy, Buy}, cross-universe, sorted by score desc.
   - **🔴 Top Sells** — top N scores where signal ∈ {Strong Sell, Sell}, sorted by score asc.
   - **⚡ Momentum** — top by `1M %` magnitude.
   - **🌡️ Heatmap** — color grid, one cell per universe × signal-band.
5. Spotlight card shows: ticker, name, score badge, signal badge, universe tag, `1M %`.
6. Clicking a spotlight card opens the ticker detail modal (UC-05).

## Acceptance criteria
- [ ] Cross-universe aggregation is correct (matches individual universe KPIs).
- [ ] Four view modes render distinct content.
- [ ] Spotlight cards are clickable → modal.
- [ ] Universe summary cards are also clickable → jump to that universe's screener.
- [ ] New `Portfolio ETFs` pseudo-universe surfaces here (32 total observed) — likely the UCITS etc. used in Portfolio Builder.
