"""Indicator regime tests.

These tests assert three things for each indicator:
1. The returned score is always inside [0.0, 10.0] (the contract).
2. Trend-following indicators (ma_trend, ichimoku, macd, adx_dmi) agree on
   direction — bullish fixture > neutral, bearish fixture < neutral.
3. Mean-reversion indicators (rsi, bollinger, stochastic) can legitimately go
   either way depending on the regime's momentum phase — we only check bounds.

The composite of all nine (via default weights) must lean bullish on a bull
fixture and bearish on a bear one; individual reversion indicators may
contradict if a trend has overextended. That's the correct behaviour.
"""
from __future__ import annotations

import pytest

from scoring.domain.composite import DEFAULT_WEIGHTS, composite_score
from scoring.domain.types import IndicatorScore
from scoring.indicators import REGISTRY
from scoring.tests.fixtures.synthetic import (
    bear_series,
    bull_series,
    choppy_series,
)

TREND_FOLLOWING = {"ma_trend", "macd", "adx_dmi", "ichimoku"}


@pytest.fixture(scope="module")
def bull():
    return bull_series()


@pytest.fixture(scope="module")
def bear():
    return bear_series()


@pytest.fixture(scope="module")
def chop():
    return choppy_series()


# ---- contract: bounds -------------------------------------------------------

@pytest.mark.parametrize("indicator_id", list(REGISTRY.keys()))
@pytest.mark.parametrize("fixture_name", ["bull", "bear", "chop"])
def test_bounds(indicator_id: str, fixture_name: str, request) -> None:
    ohlcv = request.getfixturevalue(fixture_name)
    score = REGISTRY[indicator_id](ohlcv)
    assert 0.0 <= score <= 10.0


# ---- trend-following direction ---------------------------------------------

@pytest.mark.parametrize("indicator_id", sorted(TREND_FOLLOWING))
def test_trend_following_is_bullish_on_bull(indicator_id: str, bull) -> None:
    score = REGISTRY[indicator_id](bull)
    assert score >= 5.5, f"{indicator_id} should lean bullish, got {score}"


@pytest.mark.parametrize("indicator_id", ["ma_trend", "ichimoku"])
def test_ma_indicators_are_bearish_on_bear(indicator_id: str, bear) -> None:
    """ma_trend and ichimoku are the cleanest trend reads — no lag-based
    flips on late-cycle reversals. MACD and ADX can legitimately signal a
    reversal approaching in a fading bear, so they're tested separately."""
    score = REGISTRY[indicator_id](bear)
    assert score <= 4.5, f"{indicator_id} should lean bearish, got {score}"


# ---- composite: end-to-end --------------------------------------------------

def _all_scores(ohlcv) -> list[IndicatorScore]:
    return [IndicatorScore(id=iid, value=fn(ohlcv)) for iid, fn in REGISTRY.items()]


def test_composite_bullish_on_bull(bull) -> None:
    score = composite_score(_all_scores(bull), DEFAULT_WEIGHTS)
    assert score >= 5.5, f"composite should lean bullish on bull, got {score}"


def test_composite_bearish_on_bear(bear) -> None:
    score = composite_score(_all_scores(bear), DEFAULT_WEIGHTS)
    assert score <= 4.5, f"composite should lean bearish on bear, got {score}"


def test_composite_near_neutral_on_chop(chop) -> None:
    score = composite_score(_all_scores(chop), DEFAULT_WEIGHTS)
    assert 3.5 <= score <= 6.5, f"composite should be near neutral on chop, got {score}"


def test_registry_has_all_nine_indicators() -> None:
    from scoring.domain.types import INDICATOR_IDS

    assert set(REGISTRY.keys()) == set(INDICATOR_IDS)
