---
id: UC-05
title: Open ticker detail modal with charts
actor: Guest
priority: P0
category: Detail
labels: ["feature", "modal", "charts", "P0"]
related_use_cases: [UC-01, UC-11]
screenshots:
  - docs/replicate/screenshots/detail_amd_modal.png
---

## Summary
Clicking any row opens a centered modal with a rich drilldown: header summary, timeframe tabs, chart-kind tabs, a multi-chart view, and a sidebar of per-indicator scores with weights.

## Flow
1. User clicks a row in any screener (or a card in Signals Hub spotlights).
2. Modal opens centered, focus-trapped, with the instrument's data.
3. Header shows: `Ticker | Company Name | Sector`, score badge, signal badge, `Price` with `1M / 3M / 1Y` percent chips.
4. Timeframe tabs: `1M | 3M | 6M | 1Y | 2Y | 5Y` — switching re-renders the charts with the selected window.
5. Chart-kind tabs: `Price + MA | RSI | MACD | Bollinger | Stochastic | Volume | Radar`.
6. Chart region renders the selected chart for the selected timeframe.
7. `Indicator Scores` panel lists 9 rows: indicator name, 0–10 value, active weight percent.
8. Scale legend: `0 Strong Sell | 5 Neutral | 10 Strong Buy`.
9. `Close` button (or `Esc` / backdrop click) dismisses.

## Acceptance criteria
- [ ] Modal is keyboard-accessible (trap focus, `Esc` closes, arrow-key tab switching).
- [ ] Default selections: `1Y` timeframe, `Price + MA` chart.
- [ ] All 6 numeric chart kinds render with Recharts.
- [ ] `Radar` chart plots the 9 indicator scores against a fixed 0–10 axis.
- [ ] Indicator weights in sidebar reflect the currently active preset (UC-11).
- [ ] Works consistently from every universe.

## Technical notes
- Historical data is per-ticker; published as part of the scoring snapshot or fetched on modal open.
- Consider `react-dialog` / Radix Dialog for primitive; Recharts already chosen as chart lib.
