# Feature: Light / Dark Theme Toggle

Issue: #2 · UC-12
Owner: Claude (mathursan@gmail.com)
Milestone: M1 — MVP Screener

## Customer
Same as UC-14: self-directed retail trader. Some work in a bright office, some at 11 PM after the close. Eye strain is real.

## Customer's Desired Outcome
Toggle between light and dark themes from a button in the header. The choice sticks across reloads, respects `prefers-color-scheme` on first visit, and doesn't flash the wrong theme on navigation.

## Customer problem being solved
Source app's theme toggle is disabled / unresponsive. Our replica ships a working one.

## User Experience

**F1 — First visit.** No stored preference → `prefers-color-scheme: dark` honored; site renders dark on dark systems, light on light systems.

**F2 — Click the toggle.** Icon flips (sun ↔ moon). Theme flips. Choice persists in `localStorage` under the `next-themes` key (`theme`).

**F3 — Reload.** Stored preference applied synchronously (no flash of wrong theme).

**F4 — Cross-tab.** Change in tab A propagates to tab B via storage event.

## Acceptance criteria
| ID | Requirement |
|---|---|
| R1 | SHALL wrap the root layout in `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`. |
| R2 | SHALL render a single icon-button toggle in `AppHeader` (replaces the disabled EOD-era placeholder). |
| R3 | SHALL show `Sun` icon when resolved theme is dark, `Moon` when light. |
| R4 | Clicking SHALL call `setTheme("dark")` or `setTheme("light")` — never leave `system` (explicit toggles are binary). |
| R5 | SHALL have `aria-label="Toggle theme"` on the button. |
| R6 | SHALL persist across reloads (handled by `next-themes`). |
| R7 | SHALL NOT produce a flash of unstyled / wrong theme. Use `suppressHydrationWarning` on `<html>` (already in place). |
| R8 | SHALL preserve tab, weight preset, portfolio state across theme flip (theme change MUST NOT remount the app shell). |
| R9 | SHALL work on every tab route (header is in the shell layout). |
| R10 | SHALL NOT break any existing test. |

## Design standards
Tokens-only palette already defined in `src/app/globals.css` via shadcn (oklch values + `.dark` class). `next-themes` with `attribute="class"` toggles the `.dark` class on `<html>`; Tailwind 4 picks it up automatically.

## Compliance
None beyond the disclaimer already shipped. No PII stored; theme key is local-only.

## Validation plan
- Unit: `src/components/shell/theme-toggle.test.tsx` — renders button, click calls `setTheme`.
- E2E: `e2e/theme-toggle.spec.ts` — click toggle, confirm `<html class="dark">` gets applied, reload, confirm persisted.
- Manual: visual check at 1440×900 light + dark.

## Alternatives
| Alternative | Why discard? |
|---|---|
| Roll our own theme hook via `useState` + `localStorage` | next-themes handles SSR + hydration flash correctly; no reason to reinvent |
| Persist theme on the server (cookies) | No server session; overkill for a static snapshot app |
| 3-way toggle (light/dark/system) | One click = one flip. Power users can clear localStorage to get system back. Keeps the button fast. |

## Open questions
None.
