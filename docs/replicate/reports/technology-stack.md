# Technology Stack (evidence-based)

This file is the phase-5 deliverable that pairs with `tech-stack.md` (target stack). See `tech-stack.md` for the replica stack decision and rationale; this file records the identified-vs-inferred classification for the source site.

## Evidence summary

| Concern | Claim | Classification | Evidence |
|---|---|---|---|
| UI framework | React 18 | **Identified** | `react-dom.production.min.js` in bundle header |
| Icons | lucide-react v0.462.0 | **Identified** | `@license lucide-react v0.462.0 - ISC` in bundle |
| Charts | Recharts | **Identified** | 220+ `[class*="recharts"]` DOM matches on Analytics & modal views |
| UI primitives | Radix UI | **Inferred** | Dialog structure and class names match Radix + shadcn conventions |
| Styling | Tailwind CSS | **Inferred** | Utility-class patterns in compiled CSS; Lovable default |
| Build tool | Vite | **Inferred** | `/assets/index-<8char-hash>.{js,css}` filename pattern matches Vite defaults |
| State mgmt | TanStack Query + hooks | **Inferred** | Regex hits on query-key/cache patterns in bundle |
| Routing | Client-side tab state only | **Identified** | `comprehensive-explorer.py` confirmed no real server routes; all URLs return SPA shell |
| Auth | None | **Identified** | No login forms, no `/api/auth/*`, no authenticated content |
| Data | Static JSON snapshots embedded / bundled | **Inferred** | Zero runtime XHR observed; data appears compiled into the bundle |
| Scoring pipeline | Python offline job | **Identified via docs** | Methodology tab lists `python sp500_technical_framework.py` with flags |
| Hosting | Cloudflare + Lovable platform | **Identified** | `server: cloudflare`, `__dpl` cookie, `x-deployment-id` header |

## Architectural pattern

- **Single-page application (SPA)** with client-side tab state (not URL routing).
- **Static data** — snapshots produced by a scheduled offline pipeline, consumed by the SPA at page load. No backend API.
- **No authentication, no user state persistence to a server.** The "0/5 saved" label on Methodology weight presets implies client-side persistence (likely `localStorage`) for user customizations.

## Component structure (inferred from DOM)

- Top-level shell renders a fixed header + tab bar + a switched content region.
- Each tab mounts a different container component (`Screener`, `PortfolioBuilder`, `SignalsHub`, `SignalChange`, `Analytics`, `Methodology`).
- Shared primitives: `StatCard`, `SignalBadge`, `ScreenerTable`, `TrendSparkline`, `FilterChipRow`, `TickerDetailModal`.

## Data flow

```
Python scoring job (offline)
  → writes JSON snapshot per universe
  → bundle includes snapshots (or fetches from /public/data on load)
  → React store hydrates universe summaries + instruments
  → Components read from store, filter/sort/aggregate client-side
  → User actions (tab switch, chip select, search, sort, ticker click) stay client-side
  → Weight-preset changes recompute composite scores in the client
```

## Authentication approach

None observed. Future extension points would sit at the edge (e.g. Clerk / Auth.js for the replica) if user-specific saved portfolios need to survive across devices.
