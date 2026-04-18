---
id: UC-11
title: Switch / customize / save indicator weight presets
actor: Guest
priority: P2
category: Methodology
labels: ["feature", "methodology", "P2"]
screenshots:
  - docs/replicate/screenshots/tab_methodology.png
---

## Summary
Methodology tab documents the scoring model and lets users switch between built-in weight presets, adjust sliders, and save custom presets (up to 5 slots per the `0/5 saved` label).

## Presets observed
`Default`, `Momentum Focus`, `Trend Following`, `Mean Reversion`, and `Save Current` action.

## Default weights
| Indicator | Weight | Description |
|---|---|---|
| MA Trend | 18% | SMA 20/50/200 position, golden cross, MA stack |
| MACD | 15% | Zero-line position, signal crossover, histogram |
| ADX/DMI | 13% | Trend strength × directional bias (DI+/DI−) |
| RSI | 12% | Overbought/oversold zones + momentum direction |
| SAR | 10% | Price vs SAR + distance as confidence |
| Bollinger | 10% | %B position + squeeze detection |
| Stochastic | 10% | %K/%D zone crossovers |
| OBV | 7% | Volume confirms or diverges from price |
| Ichimoku | 5% | Cloud position, TK cross, cloud type |

Total: 100%.

## Scoring bands
| Range | Signal |
|---|---|
| 8.0 – 10.0 | Strong Buy |
| 6.5 – 7.9 | Buy |
| 5.0 – 6.4 | Neutral |
| 3.5 – 4.9 | Sell |
| 0.0 – 3.4 | Strong Sell |

## Flow
1. User navigates to `Methodology`.
2. User selects a preset chip — sliders update, composite scores across the app recompute.
3. User drags any slider — remaining sliders normalize to keep total at 100%.
4. User clicks `Save Current` — prompts for a name, stores in `localStorage` under a user-preset slot (`user-<id>`).
5. User can load, rename, or delete saved presets (delete/rename affordances not observed — confirm during build).

## Acceptance criteria
- [ ] Switching preset globally recomputes composite scores (used everywhere — UC-01 to UC-10).
- [ ] Sliders are normalized to sum 100%.
- [ ] Up to 5 user-saved slots; `Save Current` is disabled when full.
- [ ] CLI reference section matches the source text verbatim.
- [ ] Band thresholds are a single shared constant used to derive `signal` from `score`.
