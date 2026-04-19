"""MACD — zero-line position dominates; signal/histogram ticks only confirm."""
from __future__ import annotations

import pandas as pd

from ._common import clamp, require_close


def _ema(series: pd.Series, span: int) -> pd.Series:
    return series.ewm(span=span, adjust=False).mean()


def score_macd(ohlcv: pd.DataFrame) -> float:
    close = require_close(ohlcv)
    macd_line = _ema(close, 12) - _ema(close, 26)
    signal_line = _ema(macd_line, 9)
    hist = macd_line - signal_line

    if len(macd_line) < 2 or len(hist) < 2:
        return 5.0

    last_macd = float(macd_line.iloc[-1])
    last_signal = float(signal_line.iloc[-1])
    last_hist = float(hist.iloc[-1])
    prev_hist = float(hist.iloc[-2])

    # Zero-line dominates: the MACD line's sign is the primary bullish/bearish
    # read. Confirming rules can amplify, but never flip the sign of the
    # indicator on their own.
    score = 5.0 + (2.5 if last_macd > 0 else -2.5)

    # Signal-line crossover confirmation — only counts when it agrees with the
    # zero-line read. A bull MACD above signal strengthens; bear MACD below
    # signal deepens. Disagreement (MACD < 0 but above signal → early
    # reversal) is suppressed to a small wobble so it can't invert the call.
    if last_macd > 0 and last_macd > last_signal:
        score += 1.5
    elif last_macd < 0 and last_macd < last_signal:
        score -= 1.5
    elif last_macd > 0 and last_macd < last_signal:
        score -= 0.5  # bull fading
    elif last_macd < 0 and last_macd > last_signal:
        score += 0.5  # bear fading

    # Histogram tick — same sign-gating. A widening positive histogram in a
    # bull run adds confidence; a widening negative one in a bear run
    # deepens. Reversal-direction ticks contribute nothing.
    if last_macd > 0 and last_hist > prev_hist:
        score += 1.0
    elif last_macd < 0 and last_hist < prev_hist:
        score -= 1.0

    return clamp(score)
