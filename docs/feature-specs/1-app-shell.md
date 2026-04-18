# Feature: App Shell & Tab Navigation

Issue: #1 · UC-14
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer

Self-directed retail / prosumer technical-analysis user ("the trader"). Opens the dashboard daily or weekly to pivot across 15 asset universes plus 4 cross-cutting tools (Portfolio Builder, Signals Hub, Signal Change, Analytics) and the Methodology reference. No authentication; state of the art for similar products (TradingView free, Finviz, StockCharts).

## Customer's Desired Outcome

Open the dashboard → click any one of 19 top-level labels → see the matching view immediately — **and** be able to share the current view via a URL that reopens to the same tab.

Tab switches must feel instantaneous (no network wait). Scrolling/sort/search state in one tab must not leak into another. Dark-mode preference and active weight preset must survive tab switches.

## Customer Problem being solved

Today the source site stores the active tab only in React state — refresh, back-button, or a shared link all land on the default `Top 50 Stocks` tab. Traders lose context. Our replica fixes this: **URL encodes the active universe**, so `?universe=japan` or `/signals-hub` loads straight into that tab.

Secondary problem: the tab bar's 19 items must render without becoming unusable on narrower screens. The source wraps to a scroll line on small widths; we match that but add keyboard navigation.

## User Experience that will solve the problem

### Primary flows

**F1 — Open the app at root**
1. User visits `/`.
2. Shell renders: brand header + two-row tab bar + status line + empty content region with a placeholder that says "The screener ships in UC-01." + persistent disclaimer footer.
3. Implicit active tab: `Top 50 Stocks` (first tab). URL is canonicalized to `/stocks` on mount.

**F2 — Click a tab**
1. User clicks any tab (e.g. `Signals Hub`).
2. URL updates to `/signals-hub` using Next.js `Link` (client-side navigation, no page reload).
3. Active-tab styling flips: filled-primary pill on the clicked tab; previous tab returns to ghost.
4. Content region re-renders with the new tab's content (initially a placeholder saying "Signals Hub ships in UC-06").
5. Status line (`Last refreshed: …`) stays mounted; it reflects snapshot asOf, not page load.

**F3 — Land via deep link**
1. User visits `/japan` directly (e.g. from a teammate's shared link).
2. Shell renders with `Japan` tab active from first paint; no flash of `Top 50 Stocks` default.
3. Back/forward buttons navigate tabs as browser history.

**F4 — Keyboard navigation**
1. User presses Tab: focus lands on the first tab.
2. Arrow-Right / Arrow-Left moves focus between tabs without activating.
3. Enter/Space activates the focused tab.
4. Home/End jump to first/last tab.

**F5 — Narrow viewport**
1. On `<768px` width, the two rows collapse to a single horizontally-scrollable strip.
2. Active tab scrolls into view when selected via keyboard or deep link.

### UI mocks

Interactive HTML mocks at:

- [`docs/feature-specs/mocks/1-app-shell.html`](./mocks/1-app-shell.html) — desktop shell at 1440px + 375px mobile preview toggle.

Mocks use pure HTML + inline CSS (no build) so they're reviewable in a raw browser. They show:
- Header brand + Live badge + theme toggle placeholder.
- Two-row tab bar with lucide-matched icons next to each label.
- Active-tab pill state (Top 50 Stocks).
- Status line.
- Empty content region with the "ships in UC-XX" placeholder.
- Disclaimer footer (verbatim copy from `src/components/shell/disclaimer.tsx`).

### Acceptance criteria (testable)

| ID | Requirement |
|---|---|
| **R1** | SHALL render 19 tabs in the order specified in `docs/replicate/analysis/uc-14-app-shell.md` (row 1 × 11 universe tabs, row 2 × 8 tool tabs). |
| **R2** | SHALL route each tab to a distinct URL path (`/stocks`, `/sector-etfs`, `/industry-etfs`, `/country-etfs`, `/currencies`, `/commodities`, `/india`, `/hong-kong`, `/singapore`, `/japan`, `/europe`, `/fixed-income`, `/broad-market`, `/growth-value`, `/portfolio`, `/signals-hub`, `/signal-change`, `/analytics`, `/methodology`). |
| **R3** | SHALL redirect `/` to `/stocks` on load (server-side redirect, no flash). |
| **R4** | SHALL apply `data-state=active` / filled primary styling to the active tab only. |
| **R5** | SHALL use Next.js `<Link>` (or `useRouter().push`) so tab switches do not trigger full page reloads. |
| **R6** | SHALL render the Disclaimer component (shipped in #17) persistently at the bottom of every route. |
| **R7** | SHALL render the Status Line component above the content region on every route (content in #8). |
| **R8** | SHALL support keyboard navigation: Tab into bar, Arrow-L/R between tabs, Enter/Space activate, Home/End. |
| **R9** | SHALL preserve theme across tab switches (wired via `next-themes` provider in root layout). |
| **R10** | SHALL preserve active weight preset across tab switches (Zustand `persist` middleware — not fully wired until #14, but the provider must be mounted here). |
| **R11** | SHALL scroll the tab bar horizontally on viewports < 768 px, and scroll the active tab into view on activation. |
| **R12** | SHALL render each tab label verbatim: "Top 50 Stocks", "Sector ETFs", "Industry ETFs", "Country ETFs", "Currencies", "Commodities", "India", "Hong Kong", "Singapore", "Japan", "Europe", "Fixed Income", "Broad Market", "Growth/Value", "Portfolio Builder", "Signals Hub", "Signal Change", "Analytics", "Methodology". |
| **R13** | SHALL render each tab with a lucide-react icon that matches the source intent: trending-up, layers, building, map-pin, dollar-sign, droplet, flag-IN, flag-HK, flag-SG, flag-JP, flag-EU, landmark (fixed income), globe (broad market), sliders (growth/value), briefcase, radio, arrow-left-right, bar-chart-3, book-open. Where an exact flag icon is not available in lucide, substitute `Flag` + a country text badge. |
| **R14** | SHALL pass a11y smoke: tab bar has `role="tablist"`, each tab has `role="tab"` and `aria-selected`, Lighthouse a11y score ≥ 95 on `/stocks`. |
| **R15** | SHALL NOT break any existing test. `pnpm test`, `pnpm exec playwright test`, and `.venv/bin/pytest scoring/` all remain green. |

### Error states

| State | Display |
|---|---|
| Unknown path (e.g. `/nope`) | Next.js default 404 (`src/app/not-found.tsx` — scaffolded in #17). |
| Tab content not yet implemented | `<PlaceholderView>` component: icon + one-line "Ships in UC-NN." + link to the issue. |
| Client-side routing error | Next.js error boundary bubbles; root layout still renders header + disclaimer. |

### Design Standards Applied

- **Source**: Generic UI baseline (no project-specific design system configured in `.fraim/config.json`). shadcn/ui primitives + lucide-react icons per `docs/architecture/architecture.md` §2.
- **Visual fidelity target**: 90%+ match to source screenshots in `docs/replicate/screenshots/home_fullpage.png` for header + tab bar + status line. Identical copy, icon-per-tab parity, equivalent spacing.
- **Deliberate deltas from source**:
  - URL-as-state (source stores in-memory only).
  - Keyboard nav + aria roles (source's a11y not audited).
  - Active-tab color uses our theme's `--color-primary` rather than the source's specific hex — tokens-first so dark mode works (#2).

## Compliance Requirements

No formal compliance regulations are configured in `.fraim/config.json`. We are a technical-analysis dashboard for retail users; applicable general-good-practice requirements:

1. **Not investment advice** — the Disclaimer component from #17 must render on every route that the app shell produces. Issue #1 must NOT bypass this (no route without `<Disclaimer />`).
2. **Data freshness honesty** — the Status Line must reflect snapshot `asOf`, not page load (full behaviour in #8; the slot is defined here).
3. **No PII collected** — the app shell must not introduce analytics beacons, cookies, or fingerprinting. Next.js `next/analytics` and similar are out of scope.
4. **Accessibility baseline** — WCAG 2.2 AA keyboard-operable nav (R8, R14). Traders using screen readers must be able to move between tabs.

## Validation Plan

### How we know it works
1. **Unit tests** (`src/**/*.test.ts{,x}`): each utility (URL ↔ universe mapper, tab-list config) has a deterministic unit test.
2. **Component tests** (`src/components/shell/**/*.test.tsx`): `TabBar` renders 19 tabs, active-tab state flips on click, keyboard nav moves focus correctly (jsdom + `@testing-library/react`).
3. **E2E** (`e2e/app-shell.spec.ts`): Playwright verifies:
   - `/` redirects to `/stocks`.
   - Clicking `Signals Hub` navigates to `/signals-hub` without a full reload.
   - Deep link to `/japan` renders Japan-active from first paint.
   - Reloading `/portfolio` stays on Portfolio tab.
   - Mobile viewport (375×667): tab bar scrolls, active tab stays in view.
4. **Visual check**: side-by-side with `docs/replicate/screenshots/home_fullpage.png` for header + tab bar region.
5. **A11y smoke**: Playwright axe-core scan returns zero serious violations on `/stocks`.

### Compliance validation
- Disclaimer component is mounted in root layout; E2E asserts it's visible on at least 3 sample routes (`/stocks`, `/portfolio`, `/methodology`).
- Manual review: Status Line shows placeholder text today ("Last refreshed: — — — — (ships in UC-13)") that clearly indicates data isn't yet wired.

## Alternatives

| Alternative | Why discard? |
|---|---|
| Store active tab in Zustand only (no URL state, like the source) | Breaks deep-linking, back/forward, and sharing; source behaviour is inferior and we flagged it as a replica improvement. |
| Single router with search-param `?universe=japan` instead of path | Works, but less readable; SEO-unfriendly; harder to scan server logs. Path segments win. |
| Use Radix `Tabs` primitive for the bar | Radix `Tabs` forces all panels into the DOM; we want lazy route-level mounting via Next.js segments. |
| Collapse the two visual rows into a single row with overflow menu | Deviates too far from source; traders lose muscle memory of the two-row layout. |
| Deliver one tab per PR | Would need 19 micro-PRs and none of them useful in isolation. This issue delivers the shell + placeholders; content PRs follow per UC. |

## Competitive Analysis

### Configured competitors

No `competitors` block configured in `.fraim/config.json`. The source site (`st-technical-analysis.lovable.app`) is the reference bar since the product is explicitly a replica.

### Additional competitors

| Competitor | Current Solution | Strengths | Weaknesses | Feedback | Market Position |
|---|---|---|---|---|---|
| **st-technical-analysis.lovable.app** (source) | Horizontal two-row tab bar with 19 tabs, icons-per-tab, in-memory state only | Clean visual hierarchy; icons reinforce intent; snappy tab switches | No deep-linking; no keyboard nav audit; a11y not emphasized | N/A (the thing we clone) | Indie tool; low adoption |
| **TradingView (free)** | Hamburger menu → categorical left rail; chart takes primary content | Rich charts, huge ticker universe | Deep menus; multi-click to switch asset class; steep learning curve | Power users love, casual users bounce | Market leader in retail TA |
| **Finviz** | Top-level horizontal nav (Screener, Maps, Groups, Portfolio, Insider, Futures, Forex, Crypto) | Dense data, cheap to scan, URL-stateful | Looks dated; no dark mode | "Fast but ugly" | Mid-tier retail |
| **StockCharts.com** | Tabbed nav with dropdowns | Deep charting, technical-analysis focus | Cluttered; 15-year-old UI | Loyal base | Niche incumbent |
| **TC2000** | Desktop-first app with tabbed workspaces | Power user features | Desktop install, paid | Pro traders | Prosumer tier |

### Competitive positioning

**Our differentiation**
- **Deep-linkable tabs** — Finviz has this; TradingView doesn't. We match Finviz's best behaviour.
- **URL encodes the active universe** → teammates can share a `/japan` link without instructions.
- **Keyboard-operable tab bar** — no competitor in this list audits this.
- **Disclaimer built into the shell** — stronger baseline than source; compliance-ready.

**If competitor X does Y**
- *If TradingView adds URL-stateful category tabs*: we remain cleaner on first load (19 tabs visible vs their hamburger drilldown).
- *If Finviz ships dark mode*: #2 already delivers dark mode here.

**Target segment** — self-directed retail / prosumer traders who want a fast, no-login dashboard pivot across global universes.

### Research sources
- Source site as of 2026-04-18: https://st-technical-analysis.lovable.app (direct observation; screenshots in `docs/replicate/screenshots/`).
- TradingView free plan (observation).
- Finviz public site (observation).
- Date of research: 2026-04-18.
- Methodology: manual browser inspection of each competitor's navigation at desktop + mobile widths.

## Open questions

1. **Tab icon parity** — Source uses some icons that don't exist in lucide as-is (country flags). Proposal: use `<Flag />` + 2-letter country code in a badge. Confirm with trader reviewer when PR opens.
2. **Placeholder view text** — should the empty tab body link to the corresponding UC issue? Proposal: yes ("Ships in UC-06 · GitHub #10").

## Traceability map

| Requirement | Covered by (once implemented) |
|---|---|
| R1, R12 | `src/lib/nav.ts` (tab-list config) + unit test |
| R2, R3, R5 | Next.js route segments `src/app/(shell)/[universe]/page.tsx` + `src/app/page.tsx` redirect |
| R4 | `src/components/shell/tab-bar.tsx` + component test |
| R6 | Already shipped in #17 root layout |
| R7 | `src/components/shell/status-line.tsx` (placeholder this issue; content in #8) |
| R8, R14 | `tab-bar.tsx` keyboard handlers + `e2e/app-shell.spec.ts` a11y scan |
| R9, R10 | `next-themes` + Zustand providers wrapped in `src/app/(shell)/layout.tsx` |
| R11 | Tailwind responsive classes + e2e viewport test |
| R13 | Icon map in `src/lib/nav.ts` |
| R15 | CI (already configured in #17) |
