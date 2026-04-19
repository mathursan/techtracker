---
author: mathursan@gmail.com
date: 2026-04-19
context: issue-3
job: feature-specification + technical-design + feature-implementation
pr: https://github.com/mathursan/techtracker/pull/21
synthesized:
---

# Retrospective — Issue #3 (UC-15 Scoring Pipeline)

## Summary
9 real indicators × 15-universe ticker lists × yfinance fetcher × re-enabled dual-cron workflow. 2 review rounds, self-merged after 4-agent APPROVE. First PR where all four agents flagged real bugs AND flagged them in non-overlapping regions (Python correctness, TA math, ops hygiene, trader truth) — the gate functioned exactly as designed.

## What went well
- **Per-regime tests with seeded synthetic data** let me iterate indicator math without network calls. 61 deterministic pytest assertions.
- **Split trend-following vs mean-reversion** test expectations (only trend-followers asserted directional on bull/bear; oscillators only bounded) prevented me from breaking legitimate contrarian signals to pass an over-simple test.
- **Per-day parquet cache** saved ~25 s per `--dry-run` on the second pass.
- **Reading the trader review as math review** caught three real semantic bugs: MACD direction flip, RSI/Stoch fighting trends. Without the domain-expert lens these would have shipped.

## What went poorly
- **Ticker-list dedupe was sloppy.** Two universes had copy-paste duplicates; architect + dev-lead + trader all caught them independently. A simple `len(tickers) == len(set(tickers))` test in `_registry.py` would have prevented.
- **MACD initial algorithm was directionally unsafe.** I let signal-cross + histogram ticks combine to +2.5 on top of a zero-line ±1.5 read — i.e. confirmations could swamp the primary read. Fixed by sign-anchoring. Lesson: when an indicator has a dominant signal (MACD zero-line) and several confirming signals, clamp the confirmers so they never flip sign.
- **RSI/Stochastic mapping was too textbook.** I encoded "overbought = -3" directly, which is how you read RSI in isolation but NOT how it works as a composite ingredient. Trader was right to push back. Redesigned to trend-aligned with extremes as risk modifiers.
- **Forgot to delete `placeholder_snapshot`** when I replaced the calling code. Dev-lead caught it. Same pattern as the dead `cn()` in #17 — writing replacement code without removing the original.
- **Runner docstring promised `--skip-fetch`** that didn't exist. Spec drift in a docstring.

## Root cause analysis
- Duplicates: manual ticker entry without a dedupe check. `_registry.py` needs a post-load invariant.
- MACD / RSI design: tests asserted "bull > 5" too loosely; the original algorithms happened to pass those loose checks even when they were directionally wrong on the bear side. Post-hoc fix worked; the lesson is to write the bear test at the same time as the bull test for any sign-carrying indicator.
- Dead code: no lint rule flags unused functions in Python. Consider `vulture` or similar in CI later.
- Docstring drift: docstring written before implementation, never re-checked. Treat docstrings as tested text.

## Decision analysis
- **Pick: pandas-based indicators, not pandas-ta wrappers.** Explicit 0-10 scoring logic is testable; pandas-ta wraps obscure this. Stands.
- **Pick: trend-aligned RSI/Stochastic.** Trader's call; correct for a composite build.
- **Pick: sign-anchored MACD.** Zero-line gets the primary vote; everything else confirms or wobbles. Correct.
- **Pick: dual cron on `scoring.yml`.** Trader DST concern closed.
- **Pick: synthetic test regime > real historical fixtures.** Cheaper to maintain, deterministic. Will revisit when we have golden historical snapshots for known tickers.

## Feedback patterns
- Architect catches contract + security (duplicate tickers cascade into `totalCount` drift downstream).
- Dev-lead catches dead code + spec drift. Every PR so far has had at least one dev-lead dead-code find.
- QA catches runtime behaviour; unique to actually-running-the-thing.
- Trader catches semantic correctness (not code correctness). Every PR touching the scoring model needs a trader review.

## Key learnings
1. **Dedupe invariants for config arrays.** Any tuple that will be iterated should assert uniqueness at construction — either `tuple(dict.fromkeys(...))` or a registry-level test.
2. **Sign-anchor composite indicators.** Dominant signals clamp confirming ones. Never let a 1.5-point confirmation outweigh a 2.5-point primary.
3. **Trend-aligned oscillators > textbook oscillators** in a composite. Overbought is a risk modifier, not a sign flip.
4. **Docstrings are tested text.** If a docstring mentions a flag, the flag exists. Else the docstring is a lie.
5. **Test pairs for sign-carrying indicators** — bull AND bear asserts go in together, never just one.
6. **Live-tape eyeball** by a trader beats any unit test for semantic correctness.

## Prevention measures
- Follow-up issue candidate: add a `test_universe_tickers_unique` test that iterates `UNIVERSES.values()` and asserts `len(u.tickers) == len(set(u.tickers))`.
- Follow-up: add `pytest --strict-markers` + optional `vulture` pass in CI to catch dead Python functions.
- Watch for: copy-paste in ticker lists, especially `.T` Tokyo and `.HK` Hong Kong where stockholders mismatch.

## Artifacts
- PR: https://github.com/mathursan/techtracker/pull/21 (merged)
- Branch: `feat/3-uc-15-scoring-pipeline` (deleted post-merge)
- Commit on `main`: `f449a3c`
- Spec: `docs/feature-specs/3-scoring-pipeline.md`
- RFC: `docs/rfcs/3-scoring-pipeline.md`
- Test matrix at merge: 61 pytest · 57 vitest · 11 playwright · all green

## Next
Issue **#4 (UC-01 screener view)** on `feat/4-uc-01-screener`. First feature that renders real data from the pipeline — should catch any TS contract drift fast.
