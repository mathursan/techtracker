from __future__ import annotations

import pytest

from scoring.domain.composite import (
    DEFAULT_WEIGHTS,
    composite_score,
    normalize_weights,
)
from scoring.domain.types import INDICATOR_IDS, IndicatorScore


def _flat(value: float) -> list[IndicatorScore]:
    return [IndicatorScore(id=iid, value=value) for iid in INDICATOR_IDS]


def test_default_weights_sum_to_100() -> None:
    assert sum(DEFAULT_WEIGHTS[iid] for iid in INDICATOR_IDS) == 100


def test_composite_equal_inputs() -> None:
    assert composite_score(_flat(7.0)) == 7.0


def test_composite_missing_indicator_treated_as_zero() -> None:
    subset = _flat(8.0)[:5]
    score = composite_score(subset)
    assert 0 < score < 8.0


def test_composite_weight_emphasis() -> None:
    indicators = _flat(5.0)
    indicators[0] = IndicatorScore(id="ma_trend", value=10.0)
    base = composite_score(indicators)
    heavy = composite_score(
        indicators, {**DEFAULT_WEIGHTS, "ma_trend": 90}
    )
    assert heavy > base


def test_normalize_zero_total_raises() -> None:
    zeros = {iid: 0.0 for iid in INDICATOR_IDS}
    with pytest.raises(ValueError):
        normalize_weights(zeros)
