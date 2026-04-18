---
author: mathursan@gmail.com
date: 2026-04-18
context: issue-17
job: project-scaffolding
pr: https://github.com/mathursan/techtracker/pull/18
synthesized:
---

# Retrospective — Issue #17 (project-scaffolding)

## Summary
Delivered the FRAIM `project-scaffolding` job (5 phases) for issue #17 plus the four-agent review gate infrastructure that gates every PR going forward. First real code in the repo: Next.js 16 App Router + TypeScript strict + Tailwind 4 + shadcn/ui + Recharts + TanStack + Zustand frontend; Python scoring package mirror; CI workflows; TS↔Python contract test for signal bands.

PR went through three review rounds: R1 all four agents `REQUEST_CHANGES`; R2 three-of-four `APPROVE`, trader blocked on compliance copy; R3 trader `APPROVE`. Merged via squash after operator approval.

## What went well

- **Four-agent gate caught real issues I would have shipped.** `/api/report-bug` endpoint was unauthenticated + abusable + violated snapshot-first architecture (architect). `tsconfig.tsbuildinfo` was staged (dev-lead). Placeholder scorer would have auto-committed `Neutral` data to `main` on Monday (both architect + trader). Disclaimer copy was missing three standard compliance phrases (trader). Each of these has a name; collectively they'd have cost 0.5–5 days of remediation after landing.
- **Parallel review cut wall-clock.** Four agents in one message, ~2 min end-to-end; I never waited on a serial queue.
- **Tombstone comments outlive memory.** Commenting out the `scoring.yml` cron with a "re-enable in #3" note is durable context; future me won't need to dig commit history.
- **Reading the FRAIM job as reference, not literal prescription** paid off. The template prescribed an MCP server entry and `sendMCPRequest` helpers; we're a Next.js web app, not an MCP server, so those were intentionally skipped with a written rationale. The scaffolding principles (port management, test infra, issue filing, E2E) transferred cleanly.
- **TS↔Python contract via fixture file** is a keeper. Generates once via `tsx` script, Python pytest asserts parity, CI check mode refuses to drift. Copying that shape for any future cross-language invariant.
- **Squashing the review-round commits on merge** kept main history clean while the PR preserved the story. The `[INFRA] #17 …` squash is self-contained; the branch's 3 individual commits tell the iteration story for anyone who spelunks.

## What went poorly

- **I wrote `/api/report-bug` on autopilot.** The FRAIM template called for an "issue filing endpoint" and I reached for a Next.js API route without asking whether a server surface fit our architecture. Architect caught this, correctly. Root cause: I pattern-matched the template instead of reading the architecture doc first. Going forward: when the FRAIM job calls for something, first check `docs/architecture/architecture.md` to see if the target project supports it.
- **Subagents don't hot-load.** I committed `.claude/agents/{four}.md` mid-session, but the Claude Code session couldn't discover them until restart. Fell back to `general-purpose` with inlined personas, which worked but lost the named-dispatch. Cost ~15 min of workaround. Lesson: when the session starts, bundle any agent definitions that will be used later, or restart after defining them.
- **Shadcn `pnpm dlx init` silently ran `git commit`.** An auto-commit with a generic `feat: initial commit` message appeared on the branch alongside my real work. Caught it via `git log` and soft-reset. Costly in time and context. Lesson: when a new tool might touch git, check `git log` before and after.
- **I forgot `public/data/` in `.gitignore` initially.** QA caught it in R2. Not a blocker because nothing was tracked there yet, but the instinct to gitignore any directory that a scheduled job writes should be automatic.
- **I lost track of review comments in-session.** Operator later had to ask me to post them as PR comments for the audit trail. Going forward: every review round gets posted on the PR in real time; this is now a project rule in `CLAUDE.md` and a feedback memory.

## Root cause analysis

- `/api/report-bug`: copy-paste from FRAIM template without architecture check.
- Auto-commit from shadcn: trusted a CLI without verifying.
- Missing `.gitignore` entry: I write the generator before I write the `.gitignore`. Invert the order.

## Decision analysis

- **Pick: squash merge** — clean `main` for scanners, full story in the PR.
- **Pick: disable cron, keep `workflow_dispatch`** — safer than shipping `Neutral` placeholder data to `main`.
- **Pick: delete `/api/report-bug`** over hardening — YAGNI. Re-introduce only when a caller exists.
- **Pick: contract via fixture file** over import-Python-from-TS or WASM — small, explicit, CI-checkable.
- **Keep: `src/core/utils/git-utils.ts` under `src/`** despite architect's should-fix. Defer to an infra-cleanup issue; not load-bearing for #1.

## Key learnings

1. **Always check `docs/architecture/architecture.md` before adding anything that could be interpreted as "backend."**
2. **Post agent reviews to the PR in the same turn the review is drafted.** In-session transcripts are ephemeral; PR comments are durable.
3. **Run `git log` before and after any third-party generator CLI.** Tools auto-commit more than they advertise.
4. **Add to `.gitignore` before writing the generator** that produces the ignored artifacts.
5. **When a job template doesn't fit the project shape, explicitly document what's intentionally skipped**, don't silently omit.
6. **Narrow exception handlers are self-documenting.** `except (OSError, ValueError)` tells the next reader exactly which boundaries this code protects against, unlike `except Exception`.
7. **Dual-layer `placeholder: true`** (envelope + per-instrument) is cheap defense-in-depth for test/stub data; worth baking in anywhere CI might publish artifacts.

## Prevention measures

- `CLAUDE.md` now requires every agent review round to be posted as a PR comment (and the prompt to each reviewer agent must include that instruction).
- `.gitignore` now covers every generated artifact directory (`.venv/`, `*.tsbuildinfo`, `public/data/`, `.next/`, `.playwright-mcp/`, etc.).
- Feedback memory saved: "Agent reviews must be posted on the PR."

## Artifacts

- PR: https://github.com/mathursan/techtracker/pull/18 (merged)
- Branch: `feat/17-project-scaffolding` (deleted post-merge)
- Commit on `main`: `0ea2c5c`
- Review comments on #18: one per agent, 2–3 rounds each
- Local test matrix at merge: vitest 32 ✓ · pytest 21 ✓ · playwright 1 ✓ · lint ✓ · typecheck ✓ · build ✓

## Next

Pick up **issue #1 (UC-14 app shell + tab nav)** via FRAIM `feature-specification` → `technical-design` → `feature-implementation` on branch `feat/1-uc-14-app-shell`.
