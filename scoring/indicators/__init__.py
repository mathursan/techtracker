"""One pure function per technical indicator. Each returns a 0-10 score.

Real implementations land in issue #3 (UC-15 scoring pipeline). This module
ships a placeholder so the contract tests and CI wiring work end-to-end.
"""
from __future__ import annotations


def placeholder_score(values: list[float]) -> float:
    """Return 5.0 regardless of input. Replaced per-indicator in #3."""
    if not values:
        return 5.0
    return 5.0
