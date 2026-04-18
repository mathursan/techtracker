"""Composite scoring. Mirrors src/domain/composite.ts."""
from __future__ import annotations

from collections.abc import Iterable, Mapping

from .types import INDICATOR_IDS, IndicatorScore

DEFAULT_WEIGHTS: dict[str, float] = {
    "ma_trend": 18,
    "macd": 15,
    "adx_dmi": 13,
    "rsi": 12,
    "sar": 10,
    "bollinger": 10,
    "stochastic": 10,
    "obv": 7,
    "ichimoku": 5,
}


def normalize_weights(weights: Mapping[str, float]) -> dict[str, float]:
    total = sum(weights.get(iid, 0.0) for iid in INDICATOR_IDS)
    if total <= 0:
        raise ValueError("normalize_weights: total weight is zero")
    return {iid: (weights.get(iid, 0.0) / total) * 100 for iid in INDICATOR_IDS}


def composite_score(
    indicators: Iterable[IndicatorScore],
    weights: Mapping[str, float] = DEFAULT_WEIGHTS,
) -> float:
    by_id = {i.id: i.value for i in indicators}
    normalized = normalize_weights(weights)
    weighted = sum(
        (normalized[iid] / 100.0) * by_id.get(iid, 0.0) for iid in INDICATOR_IDS
    )
    return round(weighted * 10) / 10
