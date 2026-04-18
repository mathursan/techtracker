# Observed Technology Stack (Source Site)

Based on the JS bundle (`/assets/index-Dd_aIBBi.js`), CSS bundle, and network observations from https://st-technical-analysis.lovable.app.

## Runtime & frameworks

| Concern | Observed | Evidence |
|---|---|---|
| UI framework | **React 18** | `react-dom.production.min.js` in bundle header comments |
| Build tool | **Vite** | `/assets/index-<hash>.js` + `/assets/index-<hash>.css` layout |
| Icons | **lucide-react v0.462.0** | License header in bundle |
| Charting | **Recharts** | 220+ `[class*="recharts"]` elements on the Analytics/modal views |
| UI primitives | **Radix UI** | Strong match count and modal structure (`role=dialog` with Radix class patterns) |
| Styling | **Tailwind CSS** (Lovable default) | Utility-first class sprawl in compiled bundle |
| State | Likely React hooks + **TanStack Query** (observed via bundle matches) | — |
| Toasts (possible) | **sonner** (unconfirmed) | — |
| Routing | Client-side only (all routes return SPA shell) | `comprehensive-explorer.py` found no real routes; tabs switch via state |

## Hosting

- **Cloudflare + Lovable platform** (`server: cloudflare`, `__dpl` cookie, `x-deployment-id` header from Lovable).
- Edge cached static build; no server-rendered content.

## Data backend

- Zero XHR/fetch calls observed in a normal page load. Data appears **embedded inline** or bundled as a static `.json` asset compiled into the JS bundle.
- The Methodology tab references a **Python offline pipeline**:
  - `sp500_technical_framework.py` with flags `--all`, `--etfs`, `--industry-etfs`, `--country-etfs`.
  - Implied: a job computes scores from market data (likely `yfinance` given ticker suffixes `.NS`, `.T`, `.L`, `=F`, `=X`) and emits JSON the frontend consumes.
- No auth, no user accounts observed.

## What we'll build the replica with

For the clone we'll pick a stack that keeps feature parity with light operational overhead:

| Choice | Rationale |
|---|---|
| **Next.js 15 (App Router) + React 19** | Same UI idioms; SSR/ISR lets us serve screeners fast without shipping the full dataset upfront; same shadcn-compatible ecosystem |
| **TypeScript** strict | Catch column-schema drift early, type the score/signal domain model |
| **Tailwind CSS 4 + shadcn/ui** | Matches source look; gives us Radix primitives + prebuilt Dialog / Tabs / Table |
| **Recharts** | Direct visual parity with source charts |
| **lucide-react** | Same icon set |
| **TanStack Table** | Sortable, column-aware headers for the 13 screener variants |
| **Zustand** | Portfolio builder state, saved weight presets, theme |
| **TanStack Query** | Fetches the static JSON score snapshots with cache + background refresh |
| **Python + yfinance + pandas-ta** (scoring job) | Closest match to the source's Python offline pipeline; runs as a scheduled job (GitHub Actions) |
| **JSON artifact publishing** | Scoring job commits `/public/data/*.json` into the repo (or uploads to object storage); frontend fetches that |
| **Vercel** for hosting | Zero-config Next.js + cron via Vercel cron or GitHub Actions |

We'll also include:
- A lightweight API layer (Next route handlers) in front of the JSON snapshots for future extension (filtering, authentication).
- Playwright smoke tests mirroring the ones we used here for discovery.
