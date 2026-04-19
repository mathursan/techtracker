"""Ichimoku Cloud — cloud position, TK cross, cloud type."""
from __future__ import annotations

import pandas as pd

from ._common import clamp


def _ichimoku(ohlcv: pd.DataFrame) -> pd.DataFrame:
    high, low, close = ohlcv["high"], ohlcv["low"], ohlcv["close"]

    def _mid(window: int) -> pd.Series:
        return (high.rolling(window).max() + low.rolling(window).min()) / 2

    tenkan = _mid(9)
    kijun = _mid(26)
    senkou_a = ((tenkan + kijun) / 2).shift(26)
    senkou_b = _mid(52).shift(26)
    return pd.DataFrame({
        "tenkan": tenkan,
        "kijun": kijun,
        "senkou_a": senkou_a,
        "senkou_b": senkou_b,
        "close": close,
    })


def score_ichimoku(ohlcv: pd.DataFrame) -> float:
    d = _ichimoku(ohlcv).dropna()
    if d.empty:
        return 5.0
    last = d.iloc[-1]
    close = float(last["close"])
    tenkan = float(last["tenkan"])
    kijun = float(last["kijun"])
    sa = float(last["senkou_a"])
    sb = float(last["senkou_b"])

    cloud_top = max(sa, sb)
    cloud_bottom = min(sa, sb)

    score = 5.0

    # Price vs cloud.
    if close > cloud_top:
        score += 2.0
    elif close < cloud_bottom:
        score -= 2.0

    # Cloud colour (Senkou A > B = bullish/green cloud).
    if sa > sb:
        score += 1.0
    else:
        score -= 1.0

    # TK cross direction and position.
    if tenkan > kijun:
        score += 1.0
    elif tenkan < kijun:
        score -= 1.0

    return clamp(score)
