# Contributing — Developer Guide

This guide is for anyone picking up TechTracker issues after the discovery phase.

## Where to start

1. Read [`docs/replicate/REPLICATION_ANALYSIS.md`](replicate/REPLICATION_ANALYSIS.md) — executive summary of the source app.
2. Skim [`docs/replicate/INDEX.md`](replicate/INDEX.md) for the artifact map.
3. Read [`docs/replicate/IMPLEMENTATION_ROADMAP.md`](replicate/IMPLEMENTATION_ROADMAP.md) for milestones and dependencies.
4. Browse [the GitHub issues](https://github.com/mathursan/techtracker/issues) — one per use case (UC-01 … UC-15).

## Picking up an issue

1. Sort by `priority:P0` first, unless you're filling a polish gap.
2. Check the issue's "Dependency map" comment — don't start until blockers are in.
3. Claim the issue by assigning yourself.
4. Open a branch named `feat/uc-NN-short-slug` (e.g. `feat/uc-01-screener`).
5. Cross-reference the use-case markdown: `docs/replicate/analysis/uc-NN-*.md`. It's the canonical acceptance spec.

## Stack cheat-sheet

See [`docs/replicate/reports/tech-stack.md`](replicate/reports/tech-stack.md) for the full rationale.

| Concern | Library | Notes |
|---|---|---|
| Framework | Next.js 15 App Router | TypeScript strict mode |
| UI | Tailwind 4 + shadcn/ui | `npx shadcn@latest add …` as needed |
| Icons | `lucide-react` | Same set as source |
| Charts | `recharts` | Same lib as source — visual parity |
| Table | `@tanstack/react-table` | Sort / filter / column defs per universe |
| Server state | `@tanstack/react-query` | Snapshot fetch + cache |
| Client state | `zustand` | Portfolio, weight presets, theme |
| Theme | `next-themes` | Drives the dark-mode toggle |
| Backend | Python 3.11+ with `yfinance`, `pandas-ta`, `pandas` | Scoring package under `scoring/` |
| CI | GitHub Actions | Scoring cron + lint/test on PRs |
| Hosting | Vercel | Next.js auto-deploy |

## Workflow

1. Write code + tests.
2. `pnpm lint` + `pnpm test` (once scaffolded).
3. Compare visual output against `docs/replicate/screenshots/<matching>.png`.
4. Tick the acceptance-criteria checkboxes inside the issue body.
5. Open a PR linking `Closes #NN`.

## Repo conventions (to apply as we build)

- Use absolute imports from `@/` root.
- Components live in `components/<area>/`; colocate tests as `*.test.tsx`.
- Shared types in `types/` (start from `data-models.md`).
- Scoring indicators live under `scoring/indicators/<name>.py`, one pure function per file.

## Communication

- Discussion threads live on the relevant issue.
- For cross-cutting concerns (design systems, scoring conventions), open a Discussion on the repo.

## Links

- Source app we're cloning: https://st-technical-analysis.lovable.app
- This repo: https://github.com/mathursan/techtracker
