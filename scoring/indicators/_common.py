"""Shared helpers for indicator scoring.

Every indicator scoring function returns a float in [0.0, 10.0] — 10 is
maximally bullish, 0 is maximally bearish, 5 is neutral. Mapping from the
raw indicator to that band is indicator-specific; the helpers here centralise
clamping + linear / piecewise mapping so each indicator stays small.
"""
from __future__ import annotations

from typing import Iterable

import pandas as pd


def clamp(value: float, low: float = 0.0, high: float = 10.0) -> float:
    if value != value:  # NaN — intentionally loud in dev
        raise ValueError("clamp: value is NaN")
    return max(low, min(high, value))


def linear_map(value: float, lo: float, hi: float, out_lo: float = 0.0, out_hi: float = 10.0) -> float:
    """Map a value from the input range to the output range, clamped."""
    if hi == lo:
        return clamp((out_lo + out_hi) / 2, out_lo, out_hi)
    t = (value - lo) / (hi - lo)
    return clamp(out_lo + t * (out_hi - out_lo), out_lo, out_hi)


def last_valid(series: pd.Series) -> float | None:
    """Return the last non-NaN value, or None if the series is all-NaN."""
    s = series.dropna()
    return float(s.iloc[-1]) if len(s) else None


def require_close(ohlcv: pd.DataFrame) -> pd.Series:
    if "close" not in ohlcv.columns:
        raise ValueError("OHLCV frame missing 'close' column")
    return ohlcv["close"]


OHLCV_COLUMNS: Iterable[str] = ("open", "high", "low", "close", "volume")


def validate_ohlcv(ohlcv: pd.DataFrame, min_rows: int = 200) -> None:
    missing = [c for c in OHLCV_COLUMNS if c not in ohlcv.columns]
    if missing:
        raise ValueError(f"OHLCV frame missing columns: {missing}")
    if len(ohlcv) < min_rows:
        raise ValueError(
            f"OHLCV frame has {len(ohlcv)} rows; need at least {min_rows}",
        )
