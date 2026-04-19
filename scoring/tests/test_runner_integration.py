"""Integration test: scorer + snapshot builder against synthetic OHLCV.

No network. Mocks `scoring.market_data.fetch_ohlcv` to return fixture
frames so the runner can write a real snapshot in a temp directory.
"""
from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

import pytest

from scoring import market_data
from scoring.runner import main
from scoring.tests.fixtures.synthetic import bull_series


def _fake_fetch(ticker: str, **_: object) -> market_data.FetchResult:
    return market_data.FetchResult(
        ticker=ticker, ohlcv=bull_series(), error=None,
    )


def test_runner_writes_snapshot_no_network(tmp_path: Path) -> None:
    with patch.object(market_data, "fetch_ohlcv", side_effect=_fake_fetch), \
         patch("scoring.runner.fetch_ohlcv", side_effect=_fake_fetch):
        rc = main(["--universe", "stocks", "--project-root", str(tmp_path)])
    assert rc == 0

    snapshot_path = tmp_path / "public" / "data" / "stocks.json"
    assert snapshot_path.exists()

    payload = json.loads(snapshot_path.read_text())
    assert payload["universe"] == "stocks"
    assert payload["summary"]["totalCount"] > 0
    assert "placeholder" not in payload
    first = payload["instruments"][0]
    assert set(first.keys()) >= {
        "ticker", "name", "price", "indicators", "compositeScore", "signal",
    }
    # Every indicator ID from the domain is present.
    ids = {i["id"] for i in first["indicators"]}
    from scoring.domain.types import INDICATOR_IDS
    assert ids == set(INDICATOR_IDS)


def test_runner_one_universe_failure_reports_nonzero(tmp_path: Path) -> None:
    def flaky(ticker: str, **_: object) -> market_data.FetchResult:
        return market_data.FetchResult(ticker=ticker, ohlcv=None, error="yfinance: 404")

    with patch.object(market_data, "fetch_ohlcv", side_effect=flaky), \
         patch("scoring.runner.fetch_ohlcv", side_effect=flaky):
        rc = main(["--universe", "stocks", "--project-root", str(tmp_path)])
    # All tickers failed → non-zero exit.
    assert rc == 1


def test_runner_dry_run_does_not_write(tmp_path: Path) -> None:
    with patch.object(market_data, "fetch_ohlcv", side_effect=_fake_fetch), \
         patch("scoring.runner.fetch_ohlcv", side_effect=_fake_fetch):
        rc = main([
            "--universe", "stocks",
            "--project-root", str(tmp_path),
            "--dry-run",
        ])
    assert rc == 0
    assert not (tmp_path / "public").exists()
