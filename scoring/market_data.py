"""Market-data fetching — yfinance wrapper with a disk cache.

Every fetch is tagged with today's UTC date; repeated calls on the same day
reuse the cache on disk (`~/.cache/techtracker-scoring/<date>/<ticker>.parquet`).
Failures on individual tickers are captured and reported — one bad ticker
does not abort the universe run.
"""
from __future__ import annotations

import os
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path

import pandas as pd

DEFAULT_CACHE_ROOT = Path(
    os.environ.get(
        "YFINANCE_CACHE_DIR",
        str(Path.home() / ".cache" / "techtracker-scoring"),
    )
)


@dataclass(frozen=True)
class FetchResult:
    ticker: str
    ohlcv: pd.DataFrame | None
    error: str | None


def _cache_path(ticker: str, as_of: datetime, root: Path) -> Path:
    day = as_of.date().isoformat()
    safe = ticker.replace("/", "_")
    return root / day / f"{safe}.parquet"


def _read_cache(path: Path) -> pd.DataFrame | None:
    if not path.exists():
        return None
    try:
        return pd.read_parquet(path)
    except Exception:  # noqa: BLE001 — boundary
        return None


def _write_cache(path: Path, frame: pd.DataFrame) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    try:
        frame.to_parquet(path)
    except Exception:  # noqa: BLE001 — cache write is best-effort
        pass


def fetch_ohlcv(
    ticker: str,
    *,
    period: str = "2y",
    interval: str = "1d",
    as_of: datetime | None = None,
    cache_root: Path | None = None,
) -> FetchResult:
    """Fetch one ticker's OHLCV. Returns a FetchResult (no exceptions)."""
    import yfinance as yf  # Lazy so unit tests don't pay the import cost.

    ts = as_of or datetime.now(timezone.utc)
    root = cache_root or DEFAULT_CACHE_ROOT
    cache_file = _cache_path(ticker, ts, root)
    cached = _read_cache(cache_file)
    if cached is not None and not cached.empty:
        return FetchResult(ticker=ticker, ohlcv=cached, error=None)

    try:
        data = yf.Ticker(ticker).history(
            period=period, interval=interval, auto_adjust=True,
        )
    except Exception as exc:  # noqa: BLE001 — boundary
        return FetchResult(ticker=ticker, ohlcv=None, error=str(exc))

    if data is None or data.empty:
        return FetchResult(
            ticker=ticker,
            ohlcv=None,
            error=f"yfinance returned no data for {ticker}",
        )

    # Normalise column names to lowercase.
    data = data.rename(columns={c: c.lower() for c in data.columns})
    expected = {"open", "high", "low", "close", "volume"}
    missing = expected - set(data.columns)
    if missing:
        return FetchResult(
            ticker=ticker,
            ohlcv=None,
            error=f"missing columns for {ticker}: {missing}",
        )

    _write_cache(cache_file, data)
    return FetchResult(ticker=ticker, ohlcv=data, error=None)


def fetch_universe(tickers: tuple[str, ...], *, period: str = "2y",
                   as_of: datetime | None = None,
                   cache_root: Path | None = None) -> list[FetchResult]:
    return [fetch_ohlcv(t, period=period, as_of=as_of, cache_root=cache_root) for t in tickers]
