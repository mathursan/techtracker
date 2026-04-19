"""Moving-Average Trend.

Scores 0–10 based on three classical trend reads:
1. Price vs SMA20/50/200 (±1 per MA).
2. MA stacking (20 > 50 > 200 bullish, inverse bearish).
3. Golden / death cross between 50 and 200 in the last 10 bars.

Matches the Methodology spec's "SMA 20/50/200 position, golden cross, MA stack".
"""
from __future__ import annotations

from math import isnan

import pandas as pd

from ._common import clamp, require_close


def _sma(series: pd.Series, window: int) -> pd.Series:
    return series.rolling(window=window, min_periods=window).mean()


def _last_or_none(series: pd.Series) -> float | None:
    if series.empty:
        return None
    val = series.iloc[-1]
    return None if isnan(val) else float(val)


def score_ma_trend(ohlcv: pd.DataFrame) -> float:
    close = require_close(ohlcv)
    last20 = _last_or_none(_sma(close, 20))
    last50 = _last_or_none(_sma(close, 50))
    last200 = _last_or_none(_sma(close, 200))
    last_close = float(close.iloc[-1])

    score = 5.0

    # (1) Price vs each available MA.
    for ma in (last20, last50, last200):
        if ma is None:
            continue
        if last_close > ma:
            score += 1.0
        elif last_close < ma:
            score -= 1.0

    # (2) MA stack.
    if last20 is not None and last50 is not None and last200 is not None:
        if last20 > last50 > last200:
            score += 1.5
        elif last20 < last50 < last200:
            score -= 1.5

    # (3) Golden / death cross in the last 10 bars (SMA50 vs SMA200).
    sma50 = _sma(close, 50)
    sma200 = _sma(close, 200)
    recent = pd.concat([sma50, sma200], axis=1).dropna().tail(10)
    if len(recent) >= 2:
        diffs = recent.iloc[:, 0] - recent.iloc[:, 1]
        if diffs.iloc[0] <= 0 and diffs.iloc[-1] > 0:
            score += 0.5  # Golden cross
        elif diffs.iloc[0] >= 0 and diffs.iloc[-1] < 0:
            score -= 0.5  # Death cross

    return clamp(score)
