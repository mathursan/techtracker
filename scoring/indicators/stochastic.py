"""Stochastic Oscillator — trend-aligned with extreme zones as reversal cue.

Same philosophy as RSI: %K > 50 is bullish momentum, not an automatic sell.
Only extreme zones (< 10 or > 90) flip the sign toward mean reversion. See
the docstring of `scoring/indicators/rsi.py` for the rationale.
"""
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
    d_val = float(last["d"])

    if k >= 90:
        score = 3.0  # extreme overbought — reversal cue
    elif k >= 70:
        score = 6.5  # bullish momentum zone, overbought risk rising
    elif k >= 55:
        score = 7.0
    elif k >= 45:
        score = 5.0
    elif k >= 30:
        score = 3.0
    elif k >= 10:
        score = 3.5
    else:
        score = 7.5  # extreme oversold

    # Crossover confirms the zone read: bullish cross in upper half → more
    # bullish; bearish cross in lower half → more bearish. Contrary crosses
    # suggest fade.
    if len(s) >= 2:
        prev_k, prev_d = float(s.iloc[-2]["k"]), float(s.iloc[-2]["d"])
        bullish_cross = prev_k <= prev_d and k > d_val
        bearish_cross = prev_k >= prev_d and k < d_val
        if bullish_cross and k >= 50:
            score += 0.8
        elif bearish_cross and k < 50:
            score -= 0.8
        elif bullish_cross and k < 50:
            score += 0.4  # fade of weakness
        elif bearish_cross and k >= 50:
            score -= 0.4  # fade of strength

    return clamp(score)
