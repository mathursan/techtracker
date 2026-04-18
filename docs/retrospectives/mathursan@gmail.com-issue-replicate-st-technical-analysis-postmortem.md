---
author: mathursan@gmail.com
date: 2026-04-18
context: replicate-st-technical-analysis
job: application-replication-workflow
synthesized:
---

# Retrospective — TechTracker Replication Discovery

## Summary
Fifteen-phase replication-analysis job against https://st-technical-analysis.lovable.app. Produced a complete analysis package, created a new private GitHub repo `mathursan/techtracker`, filed 15 use-case issues with labels, milestones, and dependency links, and published a developer onboarding guide.

## What went well

- **Playwright MCP for deep discovery**: the structured per-tab visits captured column schemas (including the universe-specific extras `AUM`, `TER`, `Country`) and chip rows with verbatim labels. These details would have been easy to miss with just screenshots.
- **Consolidated JS introspection**: grepping the bundle for lib markers (`react-dom`, `lucide-react v0.462.0`, Recharts class prefixes) gave high-confidence stack identification without opening DevTools.
- **One-use-case-per-file** decomposition made the final issue filing mechanical — each UC file was self-sufficient as an issue body.
- **Batch navigation inside a single browser_evaluate call** cut round-trips when traversing the 7 regional/segment tabs.
- **Pre-existing authorization** from the operator ("create a new project on my github... do everything") let the job run end-to-end without stalling for permission at each mutating step.

## What went poorly

- **First fraim scrape mis-read SPAs**: `scrape-site.py` only grabbed the shell; I had to pivot to the interactive explorers. Not a surprise in hindsight; a "SPA detected → fall back to Playwright" pre-check would have saved a round.
- **Dark-mode toggle unverified**: clicking the header icon button didn't visibly flip the theme in my session. I captured this as an open question, but could have persisted harder (inspect computed class, test with explicit `prefers-color-scheme` override).
- **Initial `--headless true` flag error** on `interactive-explorer.py` (the script uses a boolean flag, not a value). Re-ran with `--headless`. Minor but wasted a round.
- **Python playwright install output was silent**, which made me uncertain whether the browser install succeeded. Ended up working, but I could have asserted by running a minimal navigation.
- **Analytics click required scroll-to-top first**: first click landed while page was scrolled, and the click no-op'd visually. Added `window.scrollTo(0,0)` before the click to work around.

## Root cause analysis

- The SPA fallback issue is a skill design gap — the "site-scraping" skill should own the SPA detection, not the caller.
- The Analytics click miss is a subtle rendering timing thing: the Analytics card was offscreen; React Router / state updates after the click didn't re-render the top-level layout for a moment. Next time, explicitly wait for a DOM mutation signal rather than a hardcoded sleep.

## Decision analysis

- **Target stack = Next.js 15 + shadcn + Python scoring**. Deliberately traded minor LOC for parity-with-source (Recharts + lucide-react keep visual equivalence easy) and added `next-themes` + TanStack Table because the screener table has 13 variations and needs a sort+filter abstraction.
- **Repo private by default** with a path to public. Safer default when the operator hasn't stated intent.
- **One issue per use case** (not one issue per UI sub-component). The UC files capture enough detail that downstream PRs can split themselves.

## Feedback analysis

No operator feedback arrived during the run; all 15 phases completed on the first pass.

## Process effectiveness

- The 15-phase FRAIM structure forced good hygiene (artifacts, reports, permissions) but several phases collapsed naturally (5 and 6 shared analytical work; 8 and 9 were paper exercises pre-filed).
- Task list + phase mentoring kept me honest about completeness even when I was tempted to short-circuit.

## Key learnings

1. **For SPAs, skip the static scraper** — go straight to Playwright and capture the accessibility snapshot.
2. **Verbatim capture > paraphrase** for column headers / chip labels / presets — the schema fidelity pays off in issue acceptance criteria.
3. **Batch visits in JS** when you need consistent structure across many similar pages; single roundtrip per tab is better than N roundtrips.
4. **Click → waitForMutation > click → sleep** for React state-driven UIs.
5. **Authorization scope matters**: the operator pre-authorized repo creation; without that, I would have had to pause at phase 10. Writing `issue-plan.md` before creating the repo gave me a clear artifact to show if I had needed to ask.

## Prevention / process improvements

- Add a SPA-detection step to the `site-scraping` skill (HTML length + `<script type="module">` + near-empty `<body>`).
- Use `page.waitForFunction` for click-triggered state transitions rather than fixed sleeps.
- When writing UC files, frontmatter `priority` and `labels` lets the issue-filing step be fully mechanical.
- For big outputs (e.g. full-page accessibility snapshots), write straight to file via the tool's `filename` param — avoids blowing the context window.

## Anti-patterns to avoid

- Treating "same table" universes as 1:1 copies. Each universe has its own chip set and may add columns (AUM, TER, Country).
- Screenshotting before every assertion. Visual signal helps humans; extracting data via `browser_evaluate` is faster for machines.

## Artifacts

- Analysis package: `docs/replicate/`
- Evidence: `docs/evidence/replicate-st-technical-analysis-evidence.md`
- Repo: https://github.com/mathursan/techtracker
- Issues: https://github.com/mathursan/techtracker/issues (15)

## Phase completion map

All 15 phases completed. Phases 14 (feedback) and 15 (retro) were brief — no corrective feedback from operator.
