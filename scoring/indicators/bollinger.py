"""Bollinger Bands — %B position + squeeze detection."""
from __future__ import annotations

import pandas as pd

from ._common import clamp, require_close


def _bbands(close: pd.Series, window: int = 20, std_mult: float = 2.0) -> pd.DataFrame:
    mid = close.rolling(window).mean()
    std = close.rolling(window).std(ddof=0)
    upper = mid + std_mult * std
    lower = mid - std_mult * std
    pct_b = (close - lower) / (upper - lower)
    bandwidth = (upper - lower) / mid
    return pd.DataFrame({"mid": mid, "upper": upper, "lower": lower,
                         "pct_b": pct_b, "bandwidth": bandwidth})


def score_bollinger(ohlcv: pd.DataFrame) -> float:
    close = require_close(ohlcv)
    b = _bbands(close).dropna()
    if b.empty:
        return 5.0
    last = b.iloc[-1]
    pct_b = float(last["pct_b"])
    bandwidth = float(last["bandwidth"])

    # %B: 0 = at lower (oversold, reversion potential), 1 = at upper (overbought).
    # Map pct_b in [0, 1] → score 8 (oversold = bullish bias) to 2 (overbought
    # = bearish bias); outside the band add extra.
    if pct_b <= 0:
        score = 9.0  # Below lower = extreme oversold
    elif pct_b <= 0.2:
        score = 7.5
    elif pct_b <= 0.4:
        score = 6.0
    elif pct_b <= 0.6:
        score = 5.0
    elif pct_b <= 0.8:
        score = 4.0
    elif pct_b <= 1.0:
        score = 2.5
    else:
        score = 1.0

    # Squeeze: bandwidth < 20th percentile of last 100 bars = compression.
    # Compression alone is neutral; plus a breakout above %B 1.0 adds +1.0.
    bw_series = b["bandwidth"].tail(100)
    if len(bw_series) >= 20:
        bw_low = bw_series.quantile(0.2)
        if bandwidth < bw_low and pct_b > 1.0:
            score += 1.0
        elif bandwidth < bw_low and pct_b < 0.0:
            score -= 1.0

    return clamp(score)
