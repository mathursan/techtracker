"""MACD — zero-line position, signal crossover, histogram slope."""
from __future__ import annotations

import pandas as pd

from ._common import clamp, require_close


def _ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()


def score_macd(ohlcv: pd.DataFrame) -> float:
    close = require_close(ohlcv)
    ema12 = _ema(close, 12)
    ema26 = _ema(close, 26)
    macd_line = ema12 - ema26
    signal_line = _ema(macd_line, 9)
    hist = macd_line - signal_line

    score = 5.0

    last_macd = float(macd_line.iloc[-1])
    last_signal = float(signal_line.iloc[-1])
    last_hist = float(hist.iloc[-1])
    prev_hist = float(hist.iloc[-2]) if len(hist) >= 2 else last_hist

    # Above zero line = bullish cycle.
    if last_macd > 0:
        score += 1.5
    else:
        score -= 1.5

    # MACD above signal = bullish momentum.
    if last_macd > last_signal:
        score += 1.5
    else:
        score -= 1.5

    # Histogram expanding (strengthening) adds confidence; contracting softens.
    if last_hist > prev_hist:
        score += 1.0
    elif last_hist < prev_hist:
        score -= 1.0

    # Fresh crossover within last 3 bars magnifies effect.
    if len(hist) >= 4:
        recent = hist.iloc[-4:].values
        sign_changes = ((recent[:-1] * recent[1:]) < 0).sum()
        if sign_changes:
            score += 0.5 if last_hist > 0 else -0.5

    return clamp(score)
