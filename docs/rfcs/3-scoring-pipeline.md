# RFC — Issue #3 · UC-15 Scoring Pipeline

Author: Claude (mathursan@gmail.com)
Status: Accepted
Spec: [`docs/feature-specs/3-scoring-pipeline.md`](../feature-specs/3-scoring-pipeline.md)

## Module layout

```
scoring/
├── domain/                       # unchanged from #17 (bands, composite, types)
├── indicators/
│   ├── __init__.py               # REGISTRY: {indicator_id: score_fn}
│   ├── _common.py                # clamp, linear_map, validate_ohlcv
│   ├── ma_trend.py               # Moving-average trend
│   ├── macd.py                   # MACD + signal + histogram
│   ├── adx_dmi.py                # ADX with DI+ / DI- directional bias
│   ├── rsi.py                    # RSI with zone + momentum
│   ├── sar.py                    # Parabolic SAR with distance confidence
│   ├── bollinger.py              # %B + squeeze
│   ├── stochastic.py             # %K / %D crossover
│   ├── obv.py                    # OBV vs price slope
│   └── ichimoku.py               # Cloud position + TK cross
├── universes/
│   ├── __init__.py               # re-exports
│   └── _registry.py              # 15 universes × ticker list + chip metadata
├── market_data.py                # yfinance wrapper + per-day disk cache
├── scorer.py                     # score_instrument + build_snapshot
├── runner.py                     # CLI entry: --universe, --project-root, --dry-run
├── snapshots.py                  # (unchanged from #17) atomic writer + 35d history
└── tests/
    ├── fixtures/
    │   ├── __init__.py
    │   └── synthetic.py          # bull / bear / chop OHLCV
    ├── test_bands.py             # (unchanged)
    ├── test_composite.py         # (unchanged)
    ├── test_contract.py          # (unchanged) TS ↔ Python band parity
    ├── test_indicators.py        # per-indicator regime + composite
    └── test_runner_integration.py # end-to-end with mocked fetch
```

## Indicator scoring design

Every `score_<name>` function:
- Takes a full `pd.DataFrame` (OHLCV, lowercase columns) and returns a `float` in `[0, 10]`.
- Clamps via `_common.clamp`. `clamp` throws on NaN (loud in dev, short-circuits a silent-zero upstream bug).
- Handles short history gracefully — returns 5.0 (neutral) when there's not enough data to compute. No silent exceptions.

Scoring philosophy:
- **Trend-following indicators** (`ma_trend`, `macd`, `adx_dmi`, `ichimoku`): direction-aligned. Bullish trend ⇒ high score. Bearish trend ⇒ low.
- **Mean-reversion / oscillator indicators** (`rsi`, `bollinger`, `stochastic`): contrarian. Oversold ⇒ high score (buy opportunity). Overbought ⇒ low. This is intentional — the composite weights balance these against trend followers so the overall read doesn't whipsaw.
- **Flow indicators** (`obv`): confirmation. OBV slope aligned with price ⇒ bias strengthened; divergence ⇒ near-neutral with slight direction.

## yfinance wrapper

`market_data.fetch_ohlcv` returns a `FetchResult` (ticker, ohlcv, error) — never raises. This lets the runner iterate N tickers and tally failures without special-casing.

Cache: `~/.cache/techtracker-scoring/<YYYY-MM-DD>/<ticker>.parquet`. Parquet is small, reads fast, handles DatetimeIndex natively. The `YFINANCE_CACHE_DIR` env var overrides the root.

## Runner behaviour

`python -m scoring.runner [--universe S]* [--project-root P] [--dry-run]`

For each universe:
1. Look up ticker list + chip metadata from `UNIVERSES[slug]`.
2. Fetch each ticker (cache-first). Skip failures with a stderr log line.
3. Call `scorer.score_instrument(...)` per successful fetch → Instrument dict.
4. Wrap in `build_snapshot(...)` → ScoreSnapshot envelope.
5. `write_snapshot(project_root, slug, payload)` writes current + history.

Exit code rules:
- Zero if every universe has ≥1 successful instrument OR if `--dry-run`.
- Non-zero if any universe produced zero instruments (total fetch failure).

## Snapshot payload changes vs #17

- `placeholder: true` key removed. The presence of `summary.totalCount > 0` is the single truth for "real data shipped."
- `instruments[i].placeholder` flag removed likewise.
- All other fields preserved; TS contract at `src/domain/types.ts::ScoreSnapshot` already marks `placeholder?: boolean` as optional.

## DST-aware cron

Dual cron at 21:30 UTC and 22:30 UTC Mon-Fri. The second run is idempotent if the first already produced a snapshot with the same inputs (snapshots.py serialises deterministically with `sort_keys=True`). Concurrency group prevents simultaneous runs.

## Risks

| Risk | Mitigation |
|---|---|
| yfinance rate limits | Per-day cache; 200 tickers × 2 runs = well under limits. |
| Indicator math bugs | Regime tests + composite tests. |
| Cron overlap / race | `concurrency: scoring-snapshot` with `cancel-in-progress: false`. |
| Snapshot size growth | 35-day history cap already in `snapshots.py`. |

## Open questions (tracked in spec)
1. Asia-ticker fetch reliability.
2. Ticker list curation fidelity vs source app.
