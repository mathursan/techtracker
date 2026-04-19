"""On-Balance Volume — volume confirms or diverges from price trend."""
from __future__ import annotations

import numpy as np
import pandas as pd

from ._common import clamp


def _obv(ohlcv: pd.DataFrame) -> pd.Series:
    direction = np.sign(ohlcv["close"].diff().fillna(0))
    return (direction * ohlcv["volume"]).cumsum()


def score_obv(ohlcv: pd.DataFrame) -> float:
    if "volume" not in ohlcv.columns:
        return 5.0
    close = ohlcv["close"]
    obv = _obv(ohlcv)

    # 20-day slope of OBV vs 20-day slope of price (both normalised).
    window = 20
    if len(obv) < window + 1 or len(close) < window + 1:
        return 5.0

    obv_slope = (obv.iloc[-1] - obv.iloc[-window]) / abs(obv.iloc[-window] or 1.0)
    close_slope = (close.iloc[-1] - close.iloc[-window]) / close.iloc[-window]

    score = 5.0
    # Confirmation: same sign adds confidence.
    if obv_slope > 0 and close_slope > 0:
        score = 6.5 + min(abs(obv_slope) * 5, 2.5)
    elif obv_slope < 0 and close_slope < 0:
        score = 3.5 - min(abs(obv_slope) * 5, 2.5)
    # Divergence: opposite signs cap closer to neutral.
    elif obv_slope > 0 > close_slope:
        score = 5.5  # Price down, volume up → early accumulation hint
    elif obv_slope < 0 < close_slope:
        score = 4.5  # Price up, volume down → distribution hint
    return clamp(score)
