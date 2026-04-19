# Feature: Light / Dark Theme Toggle

Issue: #2 · UC-12
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer
Same as UC-14: self-directed retail trader. Some work in a bright office, some at 11 PM after the close. Eye strain is real.

## Customer's Desired Outcome
Toggle between light and dark themes from a button in the header. The choice sticks across reloads, respects `prefers-color-scheme` on first visit, doesn't flash the wrong theme on navigation, and stays consistent when multiple tabs are open.

## Customer problem being solved
Source app's theme toggle is disabled / unresponsive. Our replica ships a working one.

## User Experience

**F1 — First visit.** No stored preference → `prefers-color-scheme` honored; site renders dark on dark systems, light on light systems.

**F2 — Click the toggle.** Icon flips (sun ↔ moon). Theme flips. Choice persists in `localStorage['theme']` (values: `"light" | "dark"`).

**F3 — Reload.** Stored preference applied synchronously by `ThemeBootstrapScript` (first body child, inline `<script>`). No flash of wrong theme.

**F4 — Cross-tab.** Change in tab A propagates to tab B via the `storage` event. Tab B's `<html>` class flips without requiring a reload.

**F5 — System change mid-session.** If the user has NO stored preference (i.e. they're riding the system default), a `prefers-color-scheme: dark` media-query change re-applies to `<html>` automatically.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | SHALL implement theme persistence with a self-contained bootstrap script + React hook (no external theming library). Rationale: `next-themes` v0.4 did not hydrate under Next 16 + Turbopack; swapping libraries is more complex than owning the 50-line primitive. |
| R2 | SHALL render a single icon-button toggle in `AppHeader`. |
| R3 | SHALL show `Sun` icon when current theme is dark, `Moon` when light. |
| R4 | Clicking SHALL call `setTheme("dark")` or `setTheme("light")` — never leave the theme indeterminate. |
| R5 | SHALL have an `aria-label` that describes the **next** action (e.g. `"Switch to dark theme"` when currently light). |
| R6 | SHALL persist across reloads via `localStorage['theme']` (keys handled by the hand-rolled `useTheme` hook and the bootstrap script). |
| R7 | SHALL NOT produce a flash of unstyled / wrong theme. The `ThemeBootstrapScript` renders first in `<body>` and runs synchronously before any painted content. `suppressHydrationWarning` on `<html>` prevents hydration noise. |
| R8 | SHALL preserve tab, weight preset, portfolio state across theme flip (theme change MUST NOT remount the app shell). |
| R9 | SHALL work on every tab route (header is in the shell layout). |
| R10 | SHALL NOT break any existing test. |
| R11 | SHALL propagate cross-tab via a `storage` event handler in `subscribeToThemeChanges`. |
| R12 | SHALL re-apply system preference when `prefers-color-scheme` changes AND no stored preference exists. |

## Design standards
Tokens-only palette defined in `src/app/globals.css` via the `.dark` class (single source of truth — legacy `@media (prefers-color-scheme: dark)` override block removed). Tailwind 4 picks up `.dark` via `@custom-variant dark (&:is(.dark *))`.

## Compliance
None beyond the disclaimer already shipped. No PII stored; theme key is local-only.

## Validation plan
- Unit: `src/components/shell/theme-toggle.test.tsx` — renders button, click calls `setTheme`, localStorage written.
- E2E: `e2e/theme-toggle.spec.ts` — button present, toggle flips `<html>` class, choice persists across reload.
- Manual: visual check at 1440×900 light + dark.

## Alternatives
| Alternative | Why discard? |
|---|---|
| `next-themes` | Attempted; Provider context didn't hydrate under Next 16 + Turbopack. Primitive is small enough to own. |
| Server-side cookie persistence | No server session; overkill for a static-snapshot app. |
| 3-way toggle (light/dark/system) | One click = one flip. Power users can clear `localStorage['theme']` to fall back to system. |

## Open questions
None.
