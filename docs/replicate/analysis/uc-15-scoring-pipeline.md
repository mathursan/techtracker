---
id: UC-15
title: Scoring pipeline publishes snapshots
actor: Scoring Pipeline (scheduled job)
priority: P0
category: Backend
labels: ["feature", "backend", "pipeline", "P0"]
---

## Summary
Offline Python job fetches market data, computes 9 indicator scores per instrument, derives composite score + signal, and publishes per-universe JSON snapshots. The source exposes CLI flags that imply separate runs per universe; the replica should unify.

## Source CLI (documented on Methodology)
```
python sp500_technical_framework.py                 # Top 50 stocks by dollar volume
python sp500_technical_framework.py --all           # Full S&P 500
python sp500_technical_framework.py --etfs          # Stocks + sector ETFs
python sp500_technical_framework.py --industry-etfs # Industry ETFs only
python sp500_technical_framework.py --country-etfs  # Country ETFs only
```

## Replica design
- Single Python package (`scoring/`) with:
  - `universes/` — per-universe ticker lists and chip metadata.
  - `indicators/` — pure functions per indicator (MA trend, MACD, RSI, ADX/DMI, SAR, Bollinger, Stochastic, OBV, Ichimoku). Each returns a 0–10 score + the raw series.
  - `scorer.py` — applies weights, derives band-based signal.
  - `runner.py` — orchestrates: fetch (yfinance) → compute → emit JSON.
- Output: `/public/data/<universe>.json` (matches `ScoreSnapshot` in `data-models.md`).
- Schedule: GitHub Actions, weekdays 30 min after US close (~21:30 UTC), plus manual dispatch.
- Historical retention: last N=30 days of snapshots archived to `/public/data/history/<universe>/<date>.json` so UC-07 (Signal Change) can compute 1W / 1M deltas.

## Acceptance criteria
- [ ] All 15 universe JSONs regenerate cleanly in one workflow run.
- [ ] Each indicator implemented with unit tests against known fixtures.
- [ ] Scorer normalizes weights to 100 before combining.
- [ ] Band-to-signal mapping uses the shared constants (see UC-11).
- [ ] History retained ≥ 35 days to cover `1M` lookback with headroom.
- [ ] Fails loudly (non-zero exit + Actions notification) on yfinance rate-limit / missing tickers.
