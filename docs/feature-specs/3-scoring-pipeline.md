# Feature: Scoring Pipeline (UC-15)

Issue: #3 · UC-15
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer
The same trader using the app + the Python-savvy operator who runs the data job. End-users see real scores (not placeholders); operators see a deterministic, testable pipeline.

## Customer's Desired Outcome
Every weekday after US market close, fresh 0–10 composite scores for every instrument in 15 universes land in `public/data/<universe>.json`. The Next.js frontend consumes those snapshots; the `placeholder: true` flag that #17 shipped as a guard is GONE for any universe that has real data.

## User Experience (operator-side)
- **F1** Scheduled run. GitHub Actions cron fires at 21:30 UTC and 22:30 UTC on weekdays (DST-aware pair per trader R1 feedback on #17). Runner fetches OHLCV via yfinance, computes 9 indicator scores per instrument, derives composite + signal, writes snapshot files.
- **F2** Manual dispatch. `python -m scoring.runner` or `workflow_dispatch` with optional `--universe` flag.
- **F3** Local dev. `python -m scoring.runner --universe stocks --dry-run` scores without writing. Cache at `~/.cache/techtracker-scoring/<date>/` avoids re-fetching during iteration.
- **F4** Partial failures. If yfinance drops a ticker, we log + skip and continue. A universe with 100% failures returns non-zero; mixed results return zero (so the cron commits what it has).

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | SHALL implement all 9 indicators (`ma_trend`, `macd`, `adx_dmi`, `rsi`, `sar`, `bollinger`, `stochastic`, `obv`, `ichimoku`) with real math — no placeholders. Each returns a score in [0, 10]. |
| R2 | SHALL define ticker lists for all 15 universes in `scoring/universes/_registry.py`. |
| R3 | SHALL fetch OHLCV via yfinance with a per-day disk cache at `$YFINANCE_CACHE_DIR` (default `~/.cache/techtracker-scoring/<date>/<ticker>.parquet`). |
| R4 | SHALL compose a weighted score using the default weights from methodology (18/15/13/12/10/10/10/7/5). Same weights used today by the TS side. |
| R5 | SHALL map composite → signal using `signal_for_score` from `scoring/domain/bands.py`. Unchanged contract with TS. |
| R6 | SHALL write `public/data/<universe>.json` + `public/data/history/<universe>/<YYYY-MM-DD>.json` using the existing `write_snapshot` helper. |
| R7 | Snapshot payload SHALL NOT carry the `placeholder: true` flag once real scoring produces the instrument. |
| R8 | SHALL handle partial ticker failures: log, skip, continue; return non-zero exit only if the universe has zero successful instruments. |
| R9 | SHALL enable the scheduled workflow (`.github/workflows/scoring.yml`) on a dual cron covering both DST and standard-time post-close windows (21:30 UTC + 22:30 UTC, Mon-Fri). |
| R10 | SHALL provide deterministic pytest coverage: per-indicator regime tests (bull / bear / chop), registry completeness test, composite direction tests, and an integration test that runs the runner against a synthetic fixture without touching the network. |

## Compliance
No new PII. OHLCV data is public-market data from yfinance (under their terms; see `README.md` link-out). No user-contributed input is processed.

## Validation plan
- `scoring/tests/test_indicators.py` — regime tests + composite composition tests.
- `scoring/tests/test_runner_integration.py` — end-to-end runner against synthetic fixture with `fetch_ohlcv` monkey-patched; asserts snapshot shape and no `placeholder` flag.
- Contract test (`scoring/tests/test_contract.py`) still green — TS/Python bands remain aligned.
- Manual: `python -m scoring.runner --universe stocks --dry-run` against a real network, inspect scores for sanity.

## Alternatives
| Alternative | Why discard? |
|---|---|
| Pure pandas-ta wrappers | pandas-ta is installed but we compute most indicators ourselves to keep the scoring-to-score mapping explicit and testable. pandas-ta's classification would require hand-tuning anyway. |
| Paid data provider (Polygon, Tiingo) | Adds cost + credential management + rate-limit complexity for a replica project. yfinance is sufficient for EOD. |
| Real-time / intraday scoring | Explicitly a non-goal (see `docs/architecture/architecture.md` §1). EOD only. |
| One cron at fixed UTC | Produces 60-minute freshness drift across DST. Dual cron costs one extra weekday run, no-ops if no diff. |

## Open questions
1. yfinance has occasional hiccups on Asia tickers (`.HK`, `.SI`). The cache + skip-on-failure mitigates but does not eliminate — acceptable for now; revisit if Signals Hub (#10) gets too many missing-data rows.
2. Ticker list curation — this PR ships a first-pass 15-universe list. Not every ticker observed in the source replica is included (e.g. only ~40 HK names vs the source's 40, but some are best-guess). Expect trader feedback + follow-up PRs to tighten.
