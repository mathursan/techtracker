"""Produce a ScoreSnapshot for a universe.

Real per-instrument scoring lands in issue #3. This stub exists so the
snapshot writer and CI wiring are exercised. Every snapshot emitted from
this module sets `placeholder: true` on both the envelope and each
instrument so downstream consumers can refuse to render it.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from .domain.bands import signal_for_score
from .domain.composite import DEFAULT_WEIGHTS, composite_score
from .domain.types import INDICATOR_IDS, IndicatorScore


def placeholder_snapshot(universe: str) -> dict[str, Any]:
    """Return a minimal, valid snapshot dict for the given universe.

    The `placeholder: true` flag must remain on until real indicator scoring
    replaces this (tracked in issue #3).
    """
    indicators = [IndicatorScore(id=iid, value=5.0) for iid in INDICATOR_IDS]
    score = composite_score(indicators, DEFAULT_WEIGHTS)
    now = datetime.now(timezone.utc).isoformat()
    return {
        "asOf": now,
        "universe": universe,
        "placeholder": True,
        "instruments": [
            {
                "ticker": "PLACEHOLDER",
                "name": "placeholder — replaced in issue #3",
                "universe": universe,
                "price": 0.0,
                "perfOneMonth": 0.0,
                "perfThreeMonth": 0.0,
                "sparkline": [],
                "indicators": [
                    {"id": i.id, "value": i.value} for i in indicators
                ],
                "compositeScore": score,
                "signal": signal_for_score(score),
                "asOf": now,
                "placeholder": True,
            }
        ],
        "summary": {
            "universe": universe,
            "displayName": universe,
            "totalCount": 1,
            "avgScore": score,
            "strongBuyCount": 0,
            "strongSellCount": 0,
            "filters": [{"key": "all", "label": "All"}],
        },
    }
