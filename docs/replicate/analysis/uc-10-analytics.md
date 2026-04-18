---
id: UC-10
title: View Analytics (distributions and sector averages)
actor: Guest
priority: P2
category: Analytics
labels: ["feature", "analytics", "charts", "P2"]
screenshots:
  - docs/replicate/screenshots/tab_analytics.png
---

## Summary
Three summary charts over the current universe (likely Top 50 Stocks unless the UI exposes a universe picker — not observed).

## Charts
1. **Signal Distribution** — vertical bar, categories `Buy | Neutral | Sell | Strong Buy | Strong Sell`, y-axis = count.
2. **Sector Average Scores** — horizontal bar, one per sector (Information Technology, Communication Services, Industrials, Financials, Consumer Discretionary, Consumer Staples, Utilities, Materials, Health Care, Energy), x-axis 0–10.
3. **Score Distribution Histogram** — vertical bar, buckets `0-1 | 1-2 | ... | 9-10`, y-axis = count.

## Acceptance criteria
- [ ] Charts render via Recharts with responsive container.
- [ ] Default data source is the Top 50 Stocks universe (no universe picker observed — confirm during build).
- [ ] Histogram buckets match the 10 observed bins.
- [ ] Sector-average chart respects the same sector naming used in the chip row (UC-02).
