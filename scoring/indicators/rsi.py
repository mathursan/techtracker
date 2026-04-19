"""RSI — overbought/oversold zones + momentum direction."""
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

    score = 5.0

    # Zones. Oversold 30 → strong buy signal (reversion potential); above 70 =
    # overbought / late-cycle. Map centre 50 → neutral, 30 → +3, 70 → -3.
    if last <= 30:
        score += 3.0
    elif last <= 40:
        score += 1.5
    elif last <= 60:
        score += 0.0
    elif last <= 70:
        score -= 1.5
    else:
        score -= 3.0

    # Momentum direction: rising RSI adds confidence to mid-zone reads.
    if 40 < last < 70:
        if last > prev:
            score += 1.0
        elif last < prev:
            score -= 1.0

    # Divergence-lite: RSI < 50 but close at N-period high = bearish divergence.
    window = rsi.tail(20)
    close_window = close.tail(20)
    if len(window) == 20 and len(close_window) == 20:
        if close_window.iloc[-1] == close_window.max() and last < 50:
            score -= 1.0
        if close_window.iloc[-1] == close_window.min() and last > 50:
            score += 1.0

    return clamp(score)
