"""RSI — trend-aligned with overbought/oversold as risk modifiers.

Design note: RSI above 50 is MOMENTUM in the direction of the uptrend, not
an automatic sell. We map the 50-70 zone as healthy bullish, 70-85 as still
bullish but overbought-risky, and only 85+ as a mean-reversion call. Same
mirror for the bear side. This matches how a working trader reads RSI:
ride the trend until it's extreme, not bail at the first 70.
"""
from __future__ import annotations

import pandas as pd

from ._common import clamp, require_close


def _rsi(series: pd.Series, period: int = 14) -> pd.Series:
    delta = series.diff()
    gain = delta.clip(lower=0)
    loss = -delta.clip(upper=0)
    avg_gain = gain.ewm(alpha=1 / period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, adjust=False).mean()
    rs = avg_gain / avg_loss.replace(0, float("nan"))
    return 100 - (100 / (1 + rs))


def score_rsi(ohlcv: pd.DataFrame) -> float:
    close = require_close(ohlcv)
    rsi = _rsi(close, 14).dropna()
    if rsi.empty:
        return 5.0

    last = float(rsi.iloc[-1])
    prev = float(rsi.iloc[-2]) if len(rsi) >= 2 else last

    if last >= 85:
        score = 3.0  # extreme overbought — mean reversion likely
    elif last >= 70:
        score = 6.5  # still bullish but overbought risk
    elif last >= 55:
        score = 7.0  # healthy uptrend zone
    elif last >= 45:
        score = 5.0  # neutral
    elif last >= 30:
        score = 3.0  # weakness without extreme
    elif last >= 15:
        score = 3.5  # oversold — mild bounce bias
    else:
        score = 7.5  # extreme oversold — bounce likely

    # Momentum confirmation within each zone.
    if last > prev and last >= 50:
        score += 0.5
    elif last < prev and last < 50:
        score -= 0.5

    return clamp(score)
