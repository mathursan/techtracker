"""Indicator registry.

Each entry is `{ indicator_id: score_fn }`. `score_fn(ohlcv: pd.DataFrame) -> float`
returns a 0-10 score for the last bar. Keys match
`scoring/domain/types.py::INDICATOR_IDS` and `src/domain/types.ts::IndicatorId`.
"""
from __future__ import annotations

from typing import Callable

import pandas as pd

from .adx_dmi import score_adx_dmi
from .bollinger import score_bollinger
from .ichimoku import score_ichimoku
from .macd import score_macd
from .ma_trend import score_ma_trend
from .obv import score_obv
from .rsi import score_rsi
from .sar import score_sar
from .stochastic import score_stochastic

IndicatorScoreFn = Callable[[pd.DataFrame], float]

REGISTRY: dict[str, IndicatorScoreFn] = {
    "ma_trend": score_ma_trend,
    "macd": score_macd,
    "adx_dmi": score_adx_dmi,
    "rsi": score_rsi,
    "sar": score_sar,
    "bollinger": score_bollinger,
    "stochastic": score_stochastic,
    "obv": score_obv,
    "ichimoku": score_ichimoku,
}
