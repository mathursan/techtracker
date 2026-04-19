"""Parabolic SAR — price vs SAR direction + distance as confidence."""
from __future__ import annotations

import pandas as pd

from ._common import clamp


def _psar(ohlcv: pd.DataFrame, af_start: float = 0.02, af_step: float = 0.02,
          af_max: float = 0.2) -> pd.Series:
    high = ohlcv["high"].values
    low = ohlcv["low"].values
    close = ohlcv["close"].values
    n = len(close)
    if n < 3:
        return pd.Series([float("nan")] * n, index=ohlcv.index)

    psar = [0.0] * n
    trend_up = close[1] >= close[0]
    ep = high[0] if trend_up else low[0]
    af = af_start
    psar[0] = low[0] if trend_up else high[0]

    for i in range(1, n):
        prior = psar[i - 1]
        new = prior + af * (ep - prior)
        if trend_up:
            new = min(new, low[i - 1], low[max(0, i - 2)])
            if low[i] < new:
                trend_up = False
                new = ep
                ep = low[i]
                af = af_start
            else:
                if high[i] > ep:
                    ep = high[i]
                    af = min(af + af_step, af_max)
        else:
            new = max(new, high[i - 1], high[max(0, i - 2)])
            if high[i] > new:
                trend_up = True
                new = ep
                ep = high[i]
                af = af_start
            else:
                if low[i] < ep:
                    ep = low[i]
                    af = min(af + af_step, af_max)
        psar[i] = new

    return pd.Series(psar, index=ohlcv.index)


def score_sar(ohlcv: pd.DataFrame) -> float:
    close = ohlcv["close"]
    psar = _psar(ohlcv)
    last_close = float(close.iloc[-1])
    last_psar = float(psar.iloc[-1])

    # Confidence: distance between price and SAR, normalised by a recent
    # volatility proxy (20-day std of close).
    vol = close.pct_change().rolling(20).std().iloc[-1]
    if pd.isna(vol) or vol == 0:
        vol = 0.02  # Fallback ~2%

    distance_pct = (last_close - last_psar) / last_close
    # Scale to +/- 3 points when distance == 2 * vol.
    magnitude = min(abs(distance_pct) / (2 * vol), 1.0) * 3.0

    # Direction: price above SAR = bullish.
    direction = 1.0 if last_close > last_psar else -1.0
    return clamp(5.0 + direction * magnitude)
