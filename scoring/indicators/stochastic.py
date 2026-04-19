"""Stochastic Oscillator — %K/%D zone crossovers."""
from __future__ import annotations

import pandas as pd

from ._common import clamp


def _stoch(ohlcv: pd.DataFrame, k: int = 14, d: int = 3, smooth_k: int = 3) -> pd.DataFrame:
    low_min = ohlcv["low"].rolling(k).min()
    high_max = ohlcv["high"].rolling(k).max()
    raw_k = 100 * (ohlcv["close"] - low_min) / (high_max - low_min)
    pct_k = raw_k.rolling(smooth_k).mean()
    pct_d = pct_k.rolling(d).mean()
    return pd.DataFrame({"k": pct_k, "d": pct_d})


def score_stochastic(ohlcv: pd.DataFrame) -> float:
    s = _stoch(ohlcv).dropna()
    if s.empty:
        return 5.0
    last = s.iloc[-1]
    k = float(last["k"])
    d = float(last["d"])

    # Zone: < 20 oversold (bullish reversion bias), > 80 overbought.
    if k < 20:
        score = 8.0
    elif k < 40:
        score = 6.5
    elif k < 60:
        score = 5.0
    elif k < 80:
        score = 3.5
    else:
        score = 2.0

    # %K / %D crossover bonus.
    if len(s) >= 2:
        prev = s.iloc[-2]
        prev_k, prev_d = float(prev["k"]), float(prev["d"])
        if prev_k <= prev_d and k > d:
            score += 1.0  # Bullish cross
        elif prev_k >= prev_d and k < d:
            score -= 1.0  # Bearish cross

    return clamp(score)
