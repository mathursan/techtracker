# Feature: Methodology + weight presets (UC-11 · phase 1)

Issue: #14 · UC-11
Owner: Claude (mathursan@gmail.com)
Milestone: M4 — Methodology

## Customer
A trader wants to (a) read the scoring model so they trust what the composite score means, (b) switch between built-in weight presets (Default / Momentum Focus / Trend Following / Mean Reversion) to see how the market looks through a different lens, (c) hand-tune weights if they disagree with the defaults, and (d) save their tuning for later.

## Outcome

### Route
`/methodology` — existing tool tab (`plannedIssue: 14` in `src/lib/nav.ts`).

### Layout
- **Header**: `h1 "Methodology"` + lede.
- **Active preset row**: `Default | Momentum Focus | Trend Following | Mean Reversion | [Save Current (N/5)]` segmented chips. Active chip is highlighted. Clicking switches the active preset.
- **Weight editor**: 9 horizontal sliders (one per indicator, canonical order) with:
  - Indicator label
  - Current weight % (editable via slider)
  - Description column
  - Total indicator at the bottom — always shows 100% because we auto-normalize.
- **Scoring bands table**: read-only 5-row table (`Strong Sell 0.0–3.4` → `Strong Buy 8.0–10.0`).
- **CLI reference**: read-only code block matching the source text.
- **Saved presets** (if any): list the user's saved slots with load/delete actions.

### Active preset state (zustand + persist)
- `src/stores/weight-preset.ts`:
  - `activePresetId: "default" | "momentum" | "trend" | "mean-reversion" | \`user-${string}\``
  - `customPresets: { id, name, weights }[]` (up to 5)
  - `sliderDraft: Weights | null` — un-saved slider values, rendered while editing
  - actions: `setActive(id)`, `setDraft(weights)`, `saveCurrent(name)`, `deletePreset(id)`, `clearDraft()`
- Persist middleware on `localStorage["tt-weight-preset"]`. `hydrated` flag gates the UI.

### Score recomputation (phase 1 scope)
**Only the screener-view uses effective scores.** Other surfaces (Signals Hub, Signal Change, Portfolio, KPI cards) keep the server-rendered `compositeScore` for now and render with a subtle banner indicating the preset applies to the screener only. Phase 2 (follow-up issue) wires the hook into the other aggregators.

**Mechanism**: a `useEffectiveWeights()` hook returns the currently active or drafted weight table. `ScreenerTable` maps each instrument through `compositeScore(inst.indicators, effective)` at render time, so the Score column, the signal badge, and the sort order all reflect the active preset. The KPI row keeps displaying the server-computed averages because re-deriving those requires a cross-tab refactor that belongs in phase 2.

### Slider normalization
When the user drags indicator X to a new value v:
1. The delta Δ = v − prevX is computed.
2. The remaining 8 indicators absorb `−Δ` proportionally to their current weights.
3. Any indicator that would go below 0 is clamped, and the remainder re-spread across the non-clamped ones.
4. Result is rounded to integer %, with the biggest rounding delta absorbed by the indicator with the largest weight.

This keeps the sum exactly at 100 at all times.

### Save Current
- Opens a simple inline input + Save button.
- On submit: validates the name isn't empty / duplicate; stores `{ id: "user-<slug>", name, weights: sliderDraft ?? activeWeights }`; switches active to that slot; clears draft.
- `Save Current` button is disabled when `customPresets.length === 5`.

### Acceptance criteria (phase 1)
| ID | Requirement |
|---|---|
| R1 | `/methodology` renders header, preset chip row, slider grid, bands table, and CLI reference. |
| R2 | Clicking a built-in preset chip updates the active preset, loads its weights into the sliders, and persists to localStorage. |
| R3 | Dragging any slider redistributes the remaining 8 so the total stays exactly 100. |
| R4 | Active preset and custom-preset slots persist across reloads. |
| R5 | Save Current prompts for a name, stores the current weights under a `user-<slug>` id, and disables when 5 slots are full. |
| R6 | User can delete a saved preset. Deleting the active custom preset falls back to Default. |
| R7 | `ScreenerTable` Score column, SignalBadge, and sort all reflect the active preset's recomputed scores on `/stocks` (and every universe tab). |
| R8 | A banner on the screener states "Active preset: *Momentum Focus* (applies to the Score column; cross-tab aggregators update in phase 2)". Hidden when active preset is Default. |
| R9 | Bands table uses the existing `src/domain/bands.ts` constants — single source of truth. |
| R10 | `pnpm lint / typecheck / test / test:e2e / build / pytest` all green. |

## Out of scope (phase 2 or later)
- Wiring active preset through Signals Hub, Signal Change, and Portfolio aggregators (requires either a client-side hook at aggregator call sites or a re-derivation pipeline). Tracked as a separate follow-up issue.
- KPI card row recomputation — same reason.
- Analytics surfaces (UC-10).
- Rename-preset (delete + re-create covers the rare case).
- Import / export preset JSON.
- Multi-device sync — localStorage only, no backend.

## Non-goals (hard)
- No server-side persistence of presets.
- No A/B compare view.
- No "undo" / preset history beyond the 5 saved slots.
