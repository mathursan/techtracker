---
author: mathursan@gmail.com
date: 2026-04-19
context: issue-2
job: feature-specification + technical-design + feature-implementation
pr: https://github.com/mathursan/techtracker/pull/20
synthesized:
---

# Retrospective — Issue #2 (UC-12 Theme Toggle)

## Summary
Landed working light/dark toggle, localStorage persistence, pre-paint bootstrap, cross-tab + system-change sync. 3 review rounds with dev-lead; 1 round for each other reviewer. Hand-rolled primitive after `next-themes` didn't hydrate under Next 16 + Turbopack. First PR merged autonomously after 4-agent approval (operator authorized mid-session).

## What went well
- **Choosing to drop next-themes was correct.** Spent ~20 min debugging its Provider hydration failure before deciding the 50-line primitive was cheaper to own. Verified the primitive via Playwright MCP before adding tests.
- **useSyncExternalStore** is the right React primitive for "subscribe to an out-of-React state". `subscribeToThemeChanges` now watches three sources (MutationObserver on `<html>`, `storage` event, matchMedia change) in one hook.
- **Pre-paint bootstrap script as first body child** eliminated FOUC without needing `<head>` trickery.
- **Four-agent gate caught three real bugs I would have shipped**: cross-tab claim with no implementation, spec drift that mentioned next-themes after we'd ripped it, toggle border invisible in dark mode.

## What went poorly
- **Forgot to `git add` the spec file.** Commit message claimed spec changes, files committed didn't include it. Dev-lead caught it on re-review. This is the second time a file has been left out of a commit (first was the CLAUDE.md update in #17 that slipped into its own branch). Lesson: `git status` before every commit, not just `git add -A && git commit`.
- **Initial e2e test waited for next-themes hydration that never happened.** Spent a round debugging before pivoting to the hand-rolled primitive.
- **Lint exploded to 3000+ errors** when Playwright artefacts weren't eslint-ignored. Added `playwright-report/` and `test-results/` to the config. Lesson: scope `ignores` alongside `.gitignore` patterns — they solve overlapping problems.
- **Debugging next-themes took longer than it should have.** Should have pivoted after 5 minutes of "no theme-init script" evidence, not 20.

## Root cause analysis
- Missed spec file: habit of `git add -A` works most of the time but not when a file is in a different committed state. `git status` before commit is a cheap guard.
- next-themes debugging: pattern-matched an expected behaviour and didn't pivot fast enough when evidence contradicted. Bias toward "make the known-good library work" vs "replace it."
- Lint explosion: I tried to run lint on the tree without first aligning eslint ignores with `.gitignore`. Test artefacts are in both.

## Decision analysis
- **Pick: hand-roll over next-themes.** Right call. The hook is 60 lines including cross-tab + system-change subscription. No external surface.
- **Pick: bootstrap script as first body child.** Works in every deployment target. Putting it in `<head>` had stale caching issues in dev.
- **Pick: single `.dark` class as source of truth.** Removed legacy `@media` override. One fewer place to get wrong.
- **Pick: self-merge after 4-agent APPROVE.** Operator authorized. Saves one round-trip per PR without weakening the review gate.

## Feedback patterns
- Dev-lead has caught "claim in commit message is not backed by code" twice now (cross-tab claim + missing spec file). Good strict reviewer — worth biasing commits to prove claims, not just state them.
- Trader consistently catches contrast + color issues a dev-only reviewer wouldn't. Dark-mode border alpha was a real bug.
- Architect catches layering before the diff compounds. Domain stays pure.

## Key learnings
1. **`git status` before every commit** — not `git add -A && git commit`.
2. **Pivot faster on library problems.** If a dep doesn't behave as documented in 5 min of targeted debugging, evaluate whether owning the primitive is cheaper than continuing to debug.
3. **Every commit message claim needs a diff that proves it.** Don't say "updated X" unless X is in `git show --stat HEAD`.
4. **eslint ignores should mirror `.gitignore`** for test artefacts.
5. **MutationObserver + storage + matchMedia** is the full subscription set for "theme state" — any two of the three leaves a gap.

## Prevention measures
- New CLAUDE.md rule (step 7): self-merge after 4-agent APPROVE.
- Feedback memory: autonomous mode authorized.
- Commit message discipline: if a commit body says "updated X", `git diff --name-only HEAD~1` must include X.

## Artifacts
- PR: https://github.com/mathursan/techtracker/pull/20 (merged)
- Branch: `feat/2-uc-12-theme-toggle` (deleted post-merge)
- Commit on `main`: `2f17686`
- Spec: `docs/feature-specs/2-theme-toggle.md`
- Test matrix at merge: vitest 57 · playwright 11 · pytest 21 — all green
- Review rounds: architect (1) · dev-lead (3) · QA (1) · trader (1)

## Next
Pick up **issue #3 (UC-15 scoring pipeline)** on `feat/3-uc-15-scoring-pipeline`. Scope: 9 real indicators, 15-universe ticker lists, yfinance fetcher, re-enable the scoring cron (DST-aware per trader's R1 suggestion).
