# TechTracker — Claude Operating Guide

## Project
Replica of https://st-technical-analysis.lovable.app. Stack + layering decided in `docs/architecture/architecture.md`. Backlog is 15 feature issues (UC-01 … UC-15) plus #17 (scaffolding). See `docs/replicate/IMPLEMENTATION_ROADMAP.md`.

## Repo layout (once scaffolded)
- `src/` — Next.js app (App Router, TypeScript strict, Tailwind 4, shadcn/ui).
- `src/domain/` — pure domain logic (bands, composite score, filters).
- `scoring/` — Python scoring pipeline (mirror of TS domain where relevant).
- `public/data/` — per-universe JSON snapshots (current + `history/` for 35 days).
- `docs/` — replication analysis, architecture, evidence, retrospectives.
- `e2e/` — Playwright tests.

## Python
Always use the project venv at `.venv/`. Never `python3` / `pip3` from system. Activate with `source .venv/bin/activate` or call `.venv/bin/python` directly.

## Per-issue workflow (applies to every PR)

1. **FRAIM chain** — for each GitHub issue:
   - `feature-specification` — produces `docs/feature-specs/<n>-<slug>.md` + HTML/CSS mocks if UI.
   - `technical-design` — produces `docs/rfcs/<n>-<slug>.md` (with optional spike).
   - `feature-implementation` — actual code + tests.
2. **Branch** — `feat/uc-NN-short-slug` (e.g. `feat/uc-01-screener`).
3. **Build green** — before opening a PR:
   - `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm exec playwright test` all pass locally.
   - `.venv/bin/python -m pytest scoring/` passes.
   - `pnpm build` green.
4. **Four-agent review gate (MANDATORY)** — invoke every PR through all four in parallel:
   - `senior-architect` — architectural correctness, security, scaling, layering, dependency direction.
   - `senior-dev-lead` — code quality, tests, error handling, naming, DX.
   - `qa-engineer` — actually runs the code, exercises the UI, verifies acceptance criteria.
   - `trader-domain-expert` — methodology + domain + data + trader workflow fit.
5. **Iterate** — address every `Must-fix`. Re-invoke the relevant agent(s) with a diff of what changed. Loop until all four reviewers return `APPROVE`.
6. **Open the PR** on GitHub with the final review transcripts summarized in the PR description.
7. **After all four agents APPROVE, self-merge** via `gh pr merge <N> --squash --delete-branch`. The four-agent gate is the approval gate; human review is retrospective. Operator authorized this in the #2 thread.
8. Move to the next issue in priority order.

Operator-involvement exceptions (still pause for these, even after agent APPROVE):
- Force-push, `git reset --hard`, or any destructive action on `main`.
- Schema or stack decisions not already fixed in `docs/architecture/architecture.md`.
- Anything that would add a non-goal listed in `docs/architecture/architecture.md` §1 (auth, streaming data, brokerage, etc.).

### How to invoke the four-agent gate
```
Agent({ subagent_type: "senior-architect",        description: "Architect review — PR #N", prompt: "<diff or PR URL + changed files + 'post your review to PR #N via gh pr comment'>" })
Agent({ subagent_type: "senior-dev-lead",         description: "Dev-lead review — PR #N",  prompt: "..." })
Agent({ subagent_type: "qa-engineer",             description: "QA review — PR #N",        prompt: "..." })
Agent({ subagent_type: "trader-domain-expert",    description: "Trader review — PR #N",    prompt: "..." })
```

Send all four in a single message so they run in parallel.

### Agent reviews MUST land on the PR
Every review round — R1 initial, R2 after fixes, R3 if needed — must be posted as a GitHub PR comment, not left in the session transcript. Each agent's prompt must include an instruction to:

```bash
gh pr comment <N> --repo mathursan/techtracker --body-file <tmpfile>
```

…after drafting the review. Between rounds, also post a short summary comment linking to the fix commit(s) so reviewers know what changed. The operator reads the PR comment log before approving.

## Rules
- Never bypass the four-agent gate. If a reviewer returns BLOCK or REQUEST_CHANGES, fix it before moving on.
- Self-merge IS allowed once all four agents return APPROVE (see step 7 above). Operator reviews the merged history, not each PR in isolation.
- Use the TodoWrite / TaskCreate tools to track FRAIM phases and review cycles per issue.
- Keep commit messages terse and purpose-driven. End each with `Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>`.
- Respect `docs/replicate/analysis/uc-*.md` as the acceptance spec for each feature.
- Respect the non-goals listed in `docs/architecture/architecture.md` §1.

## When FRAIM MCP disconnects
Finish the in-flight phase manually, document completion in the GitHub issue, and pick up the MCP on the next reconnect. Don't block on MCP availability if a reasonable manual equivalent exists.
