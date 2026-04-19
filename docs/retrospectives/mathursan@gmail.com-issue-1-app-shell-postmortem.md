---
author: mathursan@gmail.com
date: 2026-04-18
context: issue-1
job: feature-specification + technical-design + feature-implementation
pr: https://github.com/mathursan/techtracker/pull/19
synthesized:
---

# Retrospective — Issue #1 (UC-14 App Shell & Tab Navigation)

## Summary
Delivered the app shell that every feature UC mounts inside: header + two-row tab bar + status line + placeholder view + 19 SSG routes. 2 review rounds + 1 follow-up fix. Final: 4-agent APPROVE, merged via squash.

## What went well
- **One typed nav config drives everything.** `src/lib/nav.ts` TABS array produces the tab bar, the route params, the placeholder copy, the keyboard indexing. Changes in one place propagate.
- **URL-as-state worked on first try.** Using Next.js `Link` + `usePathname()` gave us deep linking, back/forward, and shareable tabs with zero extra state.
- **Spec was load-bearing.** The 15 requirements (R1–R15) translated directly into E2E scenarios + component tests; QA ticked them one by one. No acceptance ambiguity at review time.
- **TabRow `indexOffset` design** unified keyboard navigation across two visual rows in one refs array; wrap-around worked naturally.
- **jsdom polyfill guards** (`el?.scrollIntoView?`) kept component tests fast without a browser shim.

## What went poorly
- **QA screenshot artifacts committed to the branch.** During QA's review they generated `qa-*.png` at repo root. Dev-lead blocked the PR on them. Root cause: our gitignore didn't exclude root-level PNGs. Fixed + gitignored.
- **"Live" badge in the header was a trader blocker I should have caught.** The product is EOD; the badge implied streaming. Caught in R1 by trader; cost one extra commit. Takeaway: when reviewing copy, ask "what does this claim about the data?"
- **`placeholder-view` conflated UC numbers and GitHub issue numbers.** UC-06 = issue #10 etc. Confusing display text. Architect caught it. Single source of truth for the copy ("issue #N") fixed.
- **E2E test for "client-side navigation" collected events but never asserted.** Classic half-written assertion. Dev-lead R2 caught the no-op. Replaced with a `window.__spaSentinel` that only survives if the navigation was in-process.

## Root cause analysis
- Missing gitignore entry → QA screenshots leaked. Preventable by writing the ignore BEFORE the tool creates the artifacts.
- "Live" copy → I pattern-matched from the source app. Should have questioned whether the source's claim was honest for our product (it wasn't, really, there either — the source is also EOD).
- UC-vs-issue confusion → I used `plannedIssue` as if it were a UC number. Should have separated the two (UC = spec, issue = tracker) from the start.
- E2E assertion missing → premature commit. Should have red-before-green any test that targets a specific behavior.

## Decision analysis
- **Pick: one dynamic `[slug]` segment, not 19 explicit pages.** RFC documents the trade-off: future UCs replace the catch with dedicated segments. Holds up.
- **Pick: 2-letter flag badge instead of real flag icons.** lucide-react doesn't carry country flags; our substitute is legible and searchable.
- **Pick: EOD chip over Live chip.** Correct per product reality; trader approved.
- **Pick: Spec + RFC + impl on one branch, one PR.** Kept review surface coherent. 3-phase PR works at this stage; may split when the domain is bigger.

## Feedback patterns this round
- Three of four reviewers flagged copy (UC/issue labeling, Live badge, placeholder wording). **Copy always matters more than I remember.** Treat every visible string as a trader-facing commitment.
- Dev-lead routinely asks "does this test actually assert the thing its name claims?" — worth putting in the self-review checklist.
- QA actually runs everything. If a visual regression lands, screenshots will land on the PR before the dev-lead sees the diff.

## Key learnings
1. **Gitignore the output of every tool you run, before you run the tool.**
2. **Separate UC (spec ID) from issue # (tracker ID) in all copy, always.**
3. **Every E2E test title should map to an assert-able statement. "navigates via client router" → "sentinel survives client-router transition."**
4. **Copy reviews catch more bugs than logic reviews at this stage.** Treat the PR body, status text, badges, and placeholders as first-class artifacts.
5. **The four-agent gate is faster than one human reviewer because it's parallel.** Even when it finds 12 issues, elapsed time is shorter than me re-reading my own diff once.

## Prevention measures
- `.gitignore` now excludes root-level `*.png|jpg|jpeg`.
- `CLAUDE.md` already requires each agent to post to the PR. Next issue: ensure the post happens EVERY round automatically, not just on blockers.
- Add to per-issue checklist: "Scan all new user-visible strings for honesty and consistency."

## Artifacts
- PR: https://github.com/mathursan/techtracker/pull/19 (merged)
- Branch: `feat/1-uc-14-app-shell` (deleted post-merge)
- Commit on `main`: `ef39440`
- Spec: `docs/feature-specs/1-app-shell.md`
- RFC: `docs/rfcs/1-app-shell.md`
- Mock: `docs/feature-specs/mocks/1-app-shell.html`
- Final test matrix: vitest 53 · playwright 8 · pytest 21 — all green
- Review rounds on PR: architect (2), dev-lead (3), QA (2), trader (2)

## Next
Pick up **issue #2 (UC-12 theme toggle)** on branch `feat/2-uc-12-theme-toggle`. Small scope — wire `next-themes`, wake up the header's placeholder toggle, add component + E2E tests.
</thinking>
