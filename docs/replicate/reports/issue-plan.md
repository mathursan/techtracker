# Issue Generation Plan

Each use case becomes one GitHub issue. Issues are filed into a **new** repository that we'll create in phase 10 on the operator's GitHub account.

## Repo proposal

- **Name:** `techtracker` (simple, matches source app name)
- **Visibility:** private by default (operator can flip to public later)
- **License:** MIT (replica; no code lifted from source)
- **Default branch:** `main`
- **Topics:** `technical-analysis`, `stocks`, `etfs`, `dashboard`, `nextjs`, `python`

## Labels to create

| Label | Color | Purpose |
|---|---|---|
| `priority:P0` | `#b60205` (red) | Must-have for MVP |
| `priority:P1` | `#d93f0b` (orange) | Important post-MVP |
| `priority:P2` | `#0e8a16` (green) | Nice-to-have / polish |
| `area:screener` | `#0366d6` | Screener-table features |
| `area:detail` | `#0366d6` | Ticker detail modal |
| `area:signals` | `#0366d6` | Signals Hub + Signal Change |
| `area:portfolio` | `#0366d6` | Portfolio Builder |
| `area:analytics` | `#0366d6` | Analytics charts |
| `area:methodology` | `#0366d6` | Weights + scoring config |
| `area:shell` | `#0366d6` | App shell, theme, nav |
| `area:backend` | `#0366d6` | Python scoring pipeline |
| `type:feature` | `#a2eeef` | New capability |
| `type:infra` | `#a2eeef` | Infra/devex |

## Milestones

| # | Name | Contains | Target |
|---|---|---|---|
| 1 | M1 — MVP Screener | UC-01 to UC-05, UC-13, UC-14, UC-15 | Week 2 |
| 2 | M2 — Portfolio & Signals | UC-06, UC-07, UC-08, UC-09 | Week 4 |
| 3 | M3 — Polish | UC-10, UC-11, UC-12 | Week 5 |

## Issue body template

```md
## Summary
<one-paragraph feature description from the use case>

## User story
As a **<actor>**, I want to **<action>** so that **<outcome>**.

## Use case reference
See [`docs/replicate/analysis/<uc-file>.md`](<relative link>).

## Screenshots
![<caption>](<relative path to screenshot in docs/replicate/screenshots>)

## Technical requirements
- Components: <list>
- Data models: <refs to data-models.md sections>
- Dependencies: <libs, other issues>

## Acceptance criteria
- [ ] <verbatim from UC file>
- [ ] ...

## Implementation notes
<optional — non-obvious constraints, open questions>

## Related
- Blocks: #<n>
- Blocked by: #<n>
- Related: #<n>
```

## Dependency graph

- **UC-15 (scoring pipeline)** blocks: UC-01, UC-06, UC-07, UC-10.
- **UC-01 (screener)** blocks: UC-02, UC-03, UC-04, UC-05.
- **UC-05 (detail modal)** blocks: spotlight card clicks in UC-06.
- **UC-11 (weight presets)** blocks: global recompute behaviour in UC-01, UC-06, UC-10 (soft block — baseline weights hardcoded).
- **UC-14 (tab nav)** blocks: every screen that mounts inside it.
- **UC-13, UC-12** are orthogonal polish.

## Priority summary

| Priority | UCs |
|---|---|
| P0 | UC-01, UC-02, UC-03, UC-04, UC-05, UC-14, UC-15 |
| P1 | UC-06, UC-07, UC-08, UC-09, UC-13 |
| P2 | UC-10, UC-11, UC-12 |

## Issue count

15 issues total, 1 per use case. No meta/epic issues in the first pass — the UC markdown files serve as the design doc for each.
