# TechTracker Implementation Roadmap

The user authorized: "close replication, UX can deviate if it makes sense; pick your own stack; new GitHub project; work down in priority order but do everything." Roadmap below reflects that.

## Phase groupings

### Foundation (repo scaffolding, pipelines, shell)
- **UC-14** — App shell & tab nav (P0)
- **UC-15** — Scoring pipeline (P0)
- **UC-12** — Theme toggle (P2 but tiny; pulled into foundation so design tokens are right from day 1)

### Core features (the product minimum)
- **UC-01** — Screener view (P0)
- **UC-02** — Chip filter (P0)
- **UC-03** — Search (P0)
- **UC-04** — Sort (P0)
- **UC-13** — Data freshness (P1 but trivial once pipeline writes `asOf`)
- **UC-05** — Ticker detail modal (P0)

### Secondary features (product depth)
- **UC-06** — Signals Hub (P1)
- **UC-07** — Signal Change (P1)
- **UC-08** — Preset model portfolio (P1)
- **UC-09** — Custom portfolio builder (P1)

### Polish & enhancement
- **UC-11** — Methodology + weight presets (P2)
- **UC-10** — Analytics charts (P2)

## Dependency graph

```
UC-14 (shell) ──┬── UC-01 ──┬── UC-02
                │           ├── UC-03
                │           ├── UC-04
                │           └── UC-05 ── used by UC-06 spotlight click
                │
UC-15 (data) ───┼── UC-01 ── UC-13 (asOf)
                ├── UC-06
                ├── UC-07 (needs historical snapshots)
                └── UC-10

UC-01 ── UC-08 (preset loads)
UC-01 ── UC-09 (candidate table reuses screener)

UC-11 ── (soft) UC-01, UC-06, UC-10 (weights affect composite)
UC-12 ── standalone
```

## Milestones

| Milestone | Use cases | Deliverable |
|---|---|---|
| **M1 — MVP Screener** | UC-14, UC-15 (MA Trend only + Top 50 Stocks), UC-01, UC-02, UC-03, UC-04, UC-13, UC-12, UC-05 | A working one-universe screener with detail modal and theme toggle, fed by a live scoring job |
| **M2 — Full data + signals** | UC-15 (all 9 indicators + 15 universes + history), UC-06, UC-07 | Signals Hub and Signal Change working across all universes |
| **M3 — Portfolio** | UC-08, UC-09 | Preset and custom portfolios with localStorage persistence |
| **M4 — Polish** | UC-11, UC-10 | Weight customization + Analytics charts + a11y/responsive pass |

## Acceptance (across phases)

- All 15 use-case acceptance-criteria checkboxes tick green.
- Visual regression test: replica screenshots for every tab match the source screenshots in `docs/replicate/screenshots/` within an acceptable tolerance.
- Lighthouse ≥ 95 on performance/a11y/best-practices for the home (Top 50 Stocks) view.
- Scoring pipeline runs cleanly in GitHub Actions on schedule.

## Open questions to resolve during build

Tracked on each use-case issue; gathered in `REPLICATION_ANALYSIS.md` § "Open questions to track in issues".
