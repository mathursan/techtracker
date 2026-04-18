---
id: UC-13
title: See data freshness ("Last refreshed")
actor: Guest
priority: P1
category: Shell
labels: ["feature", "data-freshness", "P1"]
---

## Summary
Single-line status under the tab bar: `🕒 Last refreshed: Apr 18, 01:11:30 PM`. Derived from the snapshot's `asOf` timestamp.

## Acceptance criteria
- [ ] Timestamp is the latest snapshot `asOf` across loaded universes.
- [ ] Tooltip shows timezone / exact ISO on hover (nice-to-have).
- [ ] Auto-refresh on a schedule (nice-to-have; source behaviour unclear).
