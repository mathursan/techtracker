---
id: UC-12
title: Toggle light / dark theme
actor: Guest
priority: P2
category: Shell
labels: ["feature", "theming", "P2"]
---

## Summary
Icon button top-right of the header toggles between light and dark themes.

## Notes
- In our session the icon click did not visibly flip the theme — treat as an open question; the replica should properly implement toggle via `next-themes` (or equivalent) and persist to `localStorage`.

## Acceptance criteria
- [ ] Toggle flips `html` class between `light` and `dark`.
- [ ] Preference persists across page loads.
- [ ] Respects `prefers-color-scheme` on first visit.
- [ ] All charts re-theme (Recharts fills, tooltips, axes).
