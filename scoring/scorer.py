"""Per-instrument scoring + snapshot payload construction.

`score_instrument` takes an OHLCV frame and returns a fully-populated
Instrument-shaped dict compatible with `src/domain/types.ts::Instrument` on
the TypeScript side.
"""
from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

import pandas as pd

from .domain.bands import signal_for_score
from .domain.composite import DEFAULT_WEIGHTS, composite_score
from .domain.types import INDICATOR_IDS, IndicatorScore
from .indicators import REGISTRY

SPARKLINE_LOOKBACK = 60  # trading days


def _sparkline(ohlcv: pd.DataFrame) -> list[float]:
    closes = ohlcv["close"].tail(SPARKLINE_LOOKBACK).to_numpy().tolist()
    return [round(float(v), 4) for v in closes]


def _pct_change_over(ohlcv: pd.DataFrame, trading_days: int) -> float | None:
    close = ohlcv["close"]
    if len(close) < trading_days + 1:
        return None
    anchor = float(close.iloc[-(trading_days + 1)])
    last = float(close.iloc[-1])
    if anchor == 0:
        return None
    return round(((last - anchor) / anchor) * 100, 2)


def score_instrument(ticker: str, name: str, universe: str,
                     ohlcv: pd.DataFrame,
                     *, as_of: datetime | None = None) -> dict[str, Any]:
    """Compute indicator scores → composite → signal; return Instrument dict."""
    scores: list[IndicatorScore] = []
    for iid in INDICATOR_IDS:
        fn = REGISTRY[iid]
        scores.append(IndicatorScore(id=iid, value=fn(ohlcv)))
    composite = composite_score(scores, DEFAULT_WEIGHTS)
    signal = signal_for_score(composite)

    ts = (as_of or datetime.now(timezone.utc)).isoformat()
    return {
        "ticker": ticker,
        "name": name,
        "universe": universe,
        "price": round(float(ohlcv["close"].iloc[-1]), 2),
        "perfOneMonth": _pct_change_over(ohlcv, 21) or 0.0,
        "perfThreeMonth": _pct_change_over(ohlcv, 63) or 0.0,
        "perfOneYear": _pct_change_over(ohlcv, 252),
        "sparkline": _sparkline(ohlcv),
        "indicators": [{"id": s.id, "value": round(s.value, 1)} for s in scores],
        "compositeScore": composite,
        "signal": signal,
        "asOf": ts,
    }


def build_snapshot(universe: str, display_name: str,
                   instruments: list[dict[str, Any]],
                   filters: list[dict[str, str]],
                   *, as_of: datetime | None = None) -> dict[str, Any]:
    """Wrap instruments in the `ScoreSnapshot` envelope."""
    if not instruments:
        return _empty_snapshot(universe, display_name, filters, as_of)
    scores = [i["compositeScore"] for i in instruments]
    avg = round(sum(scores) / len(scores), 2)
    strong_buy = sum(1 for i in instruments if i["signal"] == "Strong Buy")
    strong_sell = sum(1 for i in instruments if i["signal"] == "Strong Sell")
    ts = (as_of or datetime.now(timezone.utc)).isoformat()
    return {
        "asOf": ts,
        "universe": universe,
        "instruments": instruments,
        "summary": {
            "universe": universe,
            "displayName": display_name,
            "totalCount": len(instruments),
            "avgScore": avg,
            "strongBuyCount": strong_buy,
            "strongSellCount": strong_sell,
            "filters": filters,
        },
    }


def _empty_snapshot(universe: str, display_name: str,
                    filters: list[dict[str, str]],
                    as_of: datetime | None) -> dict[str, Any]:
    ts = (as_of or datetime.now(timezone.utc)).isoformat()
    return {
        "asOf": ts,
        "universe": universe,
        "instruments": [],
        "summary": {
            "universe": universe,
            "displayName": display_name,
            "totalCount": 0,
            "avgScore": 0.0,
            "strongBuyCount": 0,
            "strongSellCount": 0,
            "filters": filters,
        },
    }


