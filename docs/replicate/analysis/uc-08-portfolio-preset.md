---
id: UC-08
title: Load a preset model portfolio
actor: Guest
priority: P1
category: Portfolio
labels: ["feature", "portfolio-builder", "P1"]
related_use_cases: [UC-09]
screenshots:
  - docs/replicate/screenshots/tab_portfolio_builder.png
---

## Summary
Four preset macro regime model portfolios live at the top of Portfolio Builder. One click loads the holdings.

## Presets observed
| Emoji | Name | Thesis | Assets |
|---|---|---|---|
| 🔄 | Late Cycle Expansion | Quality equity, short duration, gold | 7 |
| 🔥 | Stagflation Hedge | Hard assets, commodities, inflation protection | 6 |
| 🛡️ | Risk-Off / Recession | Max quality bonds, gold, min-vol equity | 5 |
| 🚀 | Reflation / Commodity Bull | Recovery + inflation — broad equity, EM, commodities | 6 |

## Flow
1. User opens `Portfolio Builder`.
2. User clicks a preset card.
3. Portfolio panel populates with the preset's holdings (tickers + equal or prescribed weights).
4. Portfolio panel shows composite `SCORE` (weighted avg of holding scores), `WEIGHT` %, `HOLDINGS (N)`.
5. User can modify (see UC-09).

## Acceptance criteria
- [ ] Each preset defines a static holdings list stored in config.
- [ ] Loading a preset replaces current holdings (with confirm if non-empty — nice-to-have).
- [ ] Score recomputes from the current weight preset (UC-11 active preset).
- [ ] Works regardless of whether the user has made prior edits.
