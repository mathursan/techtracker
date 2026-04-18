---
id: UC-14
title: Navigate between 19 top-level tabs
actor: Guest
priority: P0
category: Shell
labels: ["feature", "navigation", "P0"]
---

## Summary
A two-row horizontal tab bar with 19 tabs. Client-side state + URL (replica choice: use URL for deep-linking; source used state only).

## Tab order (observed)
Row 1: `Top 50 Stocks`, `Sector ETFs`, `Industry ETFs`, `Country ETFs`, `Currencies`, `Commodities`, `India`, `Hong Kong`, `Singapore`, `Japan`, `Europe`.

Row 2: `Fixed Income`, `Broad Market`, `Growth/Value`, `Portfolio Builder`, `Signals Hub`, `Signal Change`, `Analytics`, `Methodology`.

## Acceptance criteria
- [ ] Tabs wrap gracefully on small screens (scroll horizontally on mobile).
- [ ] Active tab visually distinct (filled primary).
- [ ] URL updates on tab change (replica improvement over source).
- [ ] Icons match source intent: trending-up / layers / building / map-pin / dollar / droplet / flag / etc.
- [ ] Tab switching preserves theme (UC-12) and active weight preset (UC-11).
