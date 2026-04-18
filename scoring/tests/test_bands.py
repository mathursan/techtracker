from __future__ import annotations

import pytest

from scoring.domain.bands import signal_for_score


@pytest.mark.parametrize(
    ("score", "expected"),
    [
        (10.0, "Strong Buy"),
        (8.0, "Strong Buy"),
        (7.9, "Buy"),
        (6.5, "Buy"),
        (6.4, "Neutral"),
        (5.0, "Neutral"),
        (4.9, "Sell"),
        (3.5, "Sell"),
        (3.4, "Strong Sell"),
        (0.0, "Strong Sell"),
    ],
)
def test_signal_for_score(score: float, expected: str) -> None:
    assert signal_for_score(score) == expected


def test_clamps_above_ten() -> None:
    assert signal_for_score(12.5) == "Strong Buy"


def test_clamps_below_zero() -> None:
    assert signal_for_score(-1.0) == "Strong Sell"


def test_raises_on_nan() -> None:
    with pytest.raises(ValueError):
        signal_for_score(float("nan"))
