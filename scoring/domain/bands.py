"""Score-to-signal mapping. Must match src/domain/bands.ts exactly."""
from __future__ import annotations

from math import isnan

from .types import Signal


def signal_for_score(score: float) -> Signal:
    if isnan(score):
        raise ValueError("signal_for_score: score is NaN")
    clamped = max(0.0, min(10.0, score))
    if clamped >= 8.0:
        return "Strong Buy"
    if clamped >= 6.5:
        return "Buy"
    if clamped >= 5.0:
        return "Neutral"
    if clamped >= 3.5:
        return "Sell"
    return "Strong Sell"
