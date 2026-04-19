# RFC: Signals Hub (UC-06)

Issue: #10 · Feature spec: `docs/feature-specs/10-signals-hub.md`
Scope: server-rendered `/signals-hub` that aggregates every universe snapshot and renders 4 view modes + a universe strip.

## Decisions

### Layering
- `src/domain/signals-hub.ts` — pure aggregator. No I/O, no React. Deterministic `aggregateSignalsHub(snapshots) → SignalsHubViewModel`. Vitest-covered; architecture rule §3 (domain is pure).
- `src/lib/snapshots.ts` — add `loadAllSnapshots()` that iterates `TABS`, resolves missing-file → `null`, returns the list. Wraps in `React.cache` for per-request de-dup (same pattern as `loadSnapshot`).
- `src/app/[slug]/page.tsx` — dispatch on `slug === "signals-hub"` → render `<SignalsHubView initial={viewFromSearchParams} snapshots={...}/>`. Reads `searchParams.view` to pick initial view mode.
- `src/components/signals-hub/*` — presentational only. Receives already-aggregated view model via props.

Dependency direction: `app/` → `components/` → `domain/` + `lib/`. `domain/` imports nothing from `components/` or `lib/`.

### State
- View mode: URL-backed (`?view=top-buys|top-sells|momentum|heatmap`). Same pattern as `?chip=` + `?q=`.
- Modal-open ticker: reuse UC-05's local state pattern in a small `SignalsHubClient` wrapper (`"use client"`). The architect flagged lifting to a shared `ModalProvider` or URL param as a should-fix on UC-05; revisit when a third opener appears. For now, duplicate the `useState<Instrument | null>` pattern — explicit duplication over premature abstraction.

### Aggregation
- Cross-universe spotlight lists: flatten every snapshot's `instruments` with a synthetic `universe` field (already on `Instrument` via the snapshot wrapper — verify / carry through). Filter by signal predicate, sort, slice to 12.
- Momentum: filter `perfOneMonth != null`, sort by `Math.abs(perfOneMonth)` desc. Tie-break by `compositeScore` desc (bullish-biased when ties).
- Heatmap: reduce each snapshot into `{ universe, counts: Record<Signal, number> }`. Render as 15 × 5 grid. Missing universes render a dimmed row with all-zero cells and a "—" in the total.
- Universe summary cards: mirror the screener's `KPICardRow` math — `avgScore`, `strongBuyCount`, `strongSellCount`, `totalCount`. Universes without a snapshot render "No data yet".

### Heatmap color ladder
- Band → color: Strong Sell `rose-500/60`, Sell `rose-400/40`, Neutral `slate-400/30`, Buy `emerald-400/40`, Strong Buy `emerald-500/60`.
- Cell background opacity scales from `/20` (count 1) to `/60` (count ≥ 8) inside the band's base color, so heavier concentrations pop.
- Zero-count cells: `bg-muted/30` with muted text. No color.

### Spotlight card interaction
- Row click → open modal. Reuses `TickerDetailModal` from UC-05 unchanged.
- Keyboard: `role="button"`, `tabIndex={0}`, `onKeyDown` handles Enter + Space (preventDefault on Space to block page-scroll). Same recipe as the screener row.

### Data seeding (for e2e only)
- Extend `scripts/seed-e2e-data.mjs` to also emit `sector-etfs.json`, `commodities.json`, `india.json`, `europe.json`. Small fixtures (6–8 tickers each) covering a mix of bullish / bearish so the Top Buys / Top Sells / Momentum / Heatmap all have non-trivial content.
- Fixtures remain gitignored (`public/data/` is in `.gitignore`). CI seeds on every e2e run (landed in PR #27's CI fix).

### Component split
```
src/components/signals-hub/
  signals-hub-view.tsx            // server: glues strip + tabs + content panel
  signals-hub-client.tsx          // client wrapper: view state + modal state
  universe-summary-strip.tsx      // server: 15 cards
  universe-summary-card.tsx       // server: single card, renders as <Link> or dimmed <div>
  view-mode-tabs.tsx              // client: URL-backed segmented buttons
  spotlight-grid.tsx              // client: grid of SpotlightCard + open-modal handler
  spotlight-card.tsx              // client: button-like card
  heatmap-grid.tsx                // server: 15 × 5 grid
```

### Testing
- Unit (vitest):
  - `signals-hub.test.ts` — aggregator: empty input, single-universe, three-universe, filter by signal, slice to 12, momentum absolute-value sort, heatmap counts.
  - `signals-hub.empty.test.tsx` — component smoke: renders "No snapshots published yet" when input is empty.
- E2E (playwright):
  - `/signals-hub` renders strip + tabs + default Top Buys.
  - Switching to Top Sells updates URL `?view=top-sells` and content.
  - Deep link `/signals-hub?view=heatmap` renders heatmap on first paint.
  - Clicking a spotlight card opens the detail modal.
  - Clicking a populated universe card navigates to `/{slug}`.
- Python: no scoring changes.

### Risks / follow-ups
- **Scale** — 15 universes × ~50 instruments = ~750 rows loaded per request. File read + JSON parse per universe is sequential today in `loadSnapshot`. If page latency matters, `loadAllSnapshots` should `Promise.all` the reads. Do this inside the function from day one — zero downside.
- **Modal-state sprawl** — second in-component copy of the UC-05 modal state. Promote to a shared context / URL param when the Signal Change view (UC-07) also needs it.
- **Tag filter on cards** — the screener's `chip` filter doesn't apply here; spotlight cards are cross-universe by design. Not a regression, intentional scope.

## Non-decisions (defer)
- Mobile layout: desktop-first, same posture as UC-05. Responsive at `sm` breakpoint but not a redesign.
- Accessibility: Radix-free view (no dialogs here beyond reused modal). Tab-like view-mode buttons use `role="tablist"` + `aria-selected`; no arrow-key navigation (architect's UC-05 should-fix carries over — same trade-off).
