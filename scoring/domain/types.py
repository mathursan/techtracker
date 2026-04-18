"""Pure domain types — mirrors src/domain/types.ts for the contract test."""
from __future__ import annotations

from dataclasses import dataclass
from typing import Literal

Signal = Literal["Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"]

INDICATOR_IDS: tuple[str, ...] = (
    "ma_trend",
    "macd",
    "rsi",
    "adx_dmi",
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
