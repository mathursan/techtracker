# RFC — Issue #1 · UC-14 App Shell & Tab Navigation

Author: Claude (mathursan@gmail.com)
Status: Accepted
Scope: presentation layer only (architecture.md §3.1)
Spec: [`docs/feature-specs/1-app-shell.md`](../feature-specs/1-app-shell.md)

## Design decisions

### 1. Route structure — one dynamic segment
All 19 tabs are siblings under the App Router. A single catch segment `src/app/(shell)/[slug]/page.tsx` renders the placeholder view for any known slug and returns 404 for unknown slugs. This avoids 19 boilerplate route files at this stage — individual `UC-NN` PRs will replace the dynamic catch with dedicated route files as their features land.

```
src/app/
├── layout.tsx                  # root (Disclaimer, metadata)
├── page.tsx                    # "/" → server redirect to /stocks
├── not-found.tsx               # 404 (generic Next default for now)
└── (shell)/
    ├── layout.tsx              # shell chrome (Header, TabBar, StatusLine)
    └── [slug]/
        └── page.tsx            # PlaceholderView for every slug (until replaced)
```

**Why a route group `(shell)` instead of a path segment?** Keeps the paths canonical (`/stocks`, not `/shell/stocks`) while letting every shell route share a layout that mounts Header + TabBar + StatusLine once.

### 2. Tab config is a single typed array
`src/lib/nav.ts` exports a `const TABS` array of `{ slug, label, icon, description, row }`. Routes, icons, labels, and the order are all derived from it. Adding or reordering a tab is a one-line change.

### 3. Active-tab detection
`TabBar` is a server component that receives the current slug from the URL (`params.slug` in the segment, or `usePathname()` in a small client wrapper for highlighting). It uses `clsx` / `cn` to apply the active-state class.

### 4. Keyboard navigation
Tab bar is a single client component with `role="tablist"`, each tab `role="tab"` and `aria-selected`. Handlers: ArrowLeft / ArrowRight (move focus), Home / End (jump), Enter / Space (activate via Next.js `router.push`). Roving tabindex (active tab = `tabindex=0`, others = `-1`).

### 5. URL-as-state, not Zustand
Selected-tab state lives in the URL. Zustand is reserved for portfolio + weight-preset + theme persistence (wired in later issues but the providers mount here). Back/forward/refresh all Just Work.

### 6. Icons
Lucide-react icons per tab. Where lucide doesn't cover a concept (country flags), substitute a generic `Flag` icon with a small text badge (e.g. "IN"). Documented in nav.ts.

### 7. Placeholder view
`src/components/shell/placeholder-view.tsx` renders a centered icon + H2 + short copy ("Ships in UC-NN") + GitHub issue link. Each tab config carries a `plannedIssue: number` pointer used by the placeholder.

### 8. Responsive
Desktop (≥1024px): two rows, wrapping. Tablet (768–1023px): two rows, smaller labels. Mobile (<768px): single horizontal scroll strip; active tab scrolls into view via `scrollIntoView({ inline: "center" })` on mount.

## What this issue does NOT do
- No real screener content (UC-01).
- No real signals / analytics / portfolio (UC-06/07/08/09/10).
- No theme-toggle button behavior (UC-12 wires the button; this issue mounts the slot).
- No weight-preset UI (UC-11).
- No data fetching (UC-15 / UC-13 wire those).

## Testing strategy

| Level | File | What it covers |
|---|---|---|
| Unit | `src/lib/nav.test.ts` | Tab config invariants (count=19, unique slugs, row assignment, icon-per-tab, issue pointers). |
| Component | `src/components/shell/tab-bar.test.tsx` | Render 19 tabs, active state for given pathname, keyboard navigation (ArrowLeft/Right, Home/End), aria attributes. |
| E2E | `e2e/app-shell.spec.ts` | `/` redirects to `/stocks`; clicking a tab navigates without full reload (monitors `page.on('framenavigated')`); deep link to `/japan` renders Japan-active; mobile viewport scroll; a11y scan via axe-playwright. |

## Risk register

| Risk | Mitigation |
|---|---|
| lucide doesn't have flag icons | Fallback `Flag` + text badge documented in nav.ts; visual test pins the pattern. |
| Future per-universe pages need their own layout data | Route group `(shell)` is replaceable by a nested `(shell)/stocks/` etc. when individual UCs ship. |
| `usePathname` forces a client component for active-tab detection | Accept: `TabBar` is a thin client shell; placeholder page and layout remain server components. |

## Open questions (non-blocking)
1. When a future UC replaces the `[slug]` catch with a dedicated page, do we keep a fallback for unknown slugs? Yes — add a `not-found.tsx` under the shell group.
2. Should Portfolio Builder's path be `/portfolio` or `/portfolio-builder`? Spec says `/portfolio` for URL brevity; trader can flag if ambiguous.
