"""Deterministic synthetic OHLCV fixtures for indicator tests.

We generate three regimes — bull (monotonic uptrend with pullbacks), bear
(mirror), and chop (mean-reverting) — so every indicator's score can be
asserted against a regime rather than a single brittle value.
"""
from __future__ import annotations

import numpy as np
import pandas as pd


def _ohlcv_from_close(close: np.ndarray, volume: np.ndarray | None = None) -> pd.DataFrame:
    close_series = pd.Series(close, name="close")
    open_ = close_series.shift(1).fillna(close_series.iloc[0])
    # Intraday range = 1% around close, deterministic.
    span = close_series * 0.01
    high = np.maximum(open_, close_series) + span / 2
    low = np.minimum(open_, close_series) - span / 2
    if volume is None:
        volume = np.full(len(close), 1_000_000.0)
    idx = pd.date_range("2024-01-01", periods=len(close), freq="B")
    return pd.DataFrame(
        {
            "open": open_.to_numpy(),
            "high": high.to_numpy(),
            "low": low.to_numpy(),
            "close": close_series.to_numpy(),
            "volume": volume,
        },
        index=idx,
    )


def bull_series(n: int = 260, start: float = 100.0, drift: float = 0.0018,
                noise: float = 0.005) -> pd.DataFrame:
    """Uptrend with periodic pullbacks — so RSI cools between legs rather
    than sitting at 90+. Daily drift + cyclical 20-day pullback + noise."""
    rng = np.random.default_rng(42)
    t = np.arange(n)
    pullback = -0.004 * np.sin(t * 2 * np.pi / 20)
    returns = drift + pullback + rng.normal(0, noise, n)
    close = start * np.exp(np.cumsum(returns))
    volume = np.linspace(1_000_000, 1_500_000, n)
    return _ohlcv_from_close(close, volume)


def bear_series(n: int = 260, start: float = 100.0, drift: float = -0.0018,
                noise: float = 0.005) -> pd.DataFrame:
    """Downtrend symmetrical to bull — periodic bounces keep RSI realistic."""
    rng = np.random.default_rng(43)
    t = np.arange(n)
    bounce = 0.004 * np.sin(t * 2 * np.pi / 20)
    returns = drift + bounce + rng.normal(0, noise, n)
    close = start * np.exp(np.cumsum(returns))
    volume = np.linspace(1_500_000, 1_000_000, n)
    return _ohlcv_from_close(close, volume)


def choppy_series(n: int = 260, start: float = 100.0, amplitude: float = 0.03) -> pd.DataFrame:
    """Mean-reverting sinusoidal series, deterministic (no RNG)."""
    t = np.arange(n)
    close = start * (1 + amplitude * np.sin(t * 2 * np.pi / 20))
    volume = np.full(n, 1_000_000.0)
    return _ohlcv_from_close(close, volume)
