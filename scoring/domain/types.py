"""Pure domain types — mirrors src/domain/types.ts for the contract test."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Signal = Literal["Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"]

# Canonical order — matches src/domain/types.ts INDICATOR_IDS and the weight
# table in docs/replicate/analysis/uc-11-methodology-weights.md.
INDICATOR_IDS: tuple[str, ...] = (
    "ma_trend",
    "macd",
    "adx_dmi",
    "rsi",
    "sar",
    "bollinger",
    "stochastic",
    "obv",
    "ichimoku",
)


@dataclass(frozen=True)
class IndicatorScore:
    id: str
    value: float
