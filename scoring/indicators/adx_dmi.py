"""ADX + DMI — trend strength × directional bias."""
from __future__ import annotations

import numpy as np
import pandas as pd

from ._common import clamp


def _adx_dmi(ohlcv: pd.DataFrame, period: int = 14) -> pd.DataFrame:
    high, low, close = ohlcv["high"], ohlcv["low"], ohlcv["close"]

    up_move = high.diff()
    down_move = -low.diff()
    plus_dm = up_move.where((up_move > down_move) & (up_move > 0), 0.0)
    minus_dm = down_move.where((down_move > up_move) & (down_move > 0), 0.0)

    tr = pd.concat(
        [
            high - low,
            (high - close.shift()).abs(),
            (low - close.shift()).abs(),
        ],
        axis=1,
    ).max(axis=1)

    atr = tr.ewm(alpha=1 / period, adjust=False).mean()
    plus_di = 100 * plus_dm.ewm(alpha=1 / period, adjust=False).mean() / atr
    minus_di = 100 * minus_dm.ewm(alpha=1 / period, adjust=False).mean() / atr
    dx = 100 * (plus_di - minus_di).abs() / (plus_di + minus_di).replace(0, np.nan)
    adx = dx.ewm(alpha=1 / period, adjust=False).mean()

    return pd.DataFrame({"adx": adx, "plus_di": plus_di, "minus_di": minus_di})


def score_adx_dmi(ohlcv: pd.DataFrame) -> float:
    d = _adx_dmi(ohlcv).dropna()
    if d.empty:
        return 5.0
    last = d.iloc[-1]
    adx = float(last["adx"])
    plus_di = float(last["plus_di"])
    minus_di = float(last["minus_di"])

    # Strength: ADX < 20 = no trend; 20-40 = moderate; > 40 = strong.
    if adx < 20:
        strength_magnitude = 0.5  # Weak — small bias moves
    elif adx < 25:
        strength_magnitude = 1.5
    elif adx < 40:
        strength_magnitude = 2.5
    else:
        strength_magnitude = 3.5

    # Directional bias: +DI > -DI bullish, else bearish.
    direction = 1.0 if plus_di > minus_di else -1.0

    # Bias magnitude: 0 at equal, max at 30-point DI gap.
    di_gap = min(abs(plus_di - minus_di), 30.0) / 30.0

    score = 5.0 + direction * strength_magnitude * (0.5 + 0.5 * di_gap)
    return clamp(score)
