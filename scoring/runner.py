"""Entry point for the scoring pipeline.

Usage:
    python -m scoring.runner                    # all universes
    python -m scoring.runner --universe stocks  # one universe
    python -m scoring.runner --dry-run          # skip writing snapshots

Network: invokes yfinance via `scoring.market_data`, which serves from the
per-day parquet cache first and falls back to the network on miss.
"""
from __future__ import annotations

import argparse
import sys
from datetime import datetime, timezone
from pathlib import Path

from .market_data import fetch_ohlcv
from .scorer import build_snapshot, score_instrument
from .snapshots import write_snapshot
from .universes import UNIVERSES


def _name_from_ticker(ticker: str) -> str:
    """Fallback instrument name when yfinance doesn't return one."""
    return ticker


def _run_universe(slug: str, *, as_of: datetime, project_root: Path,
                  dry_run: bool) -> int:
    defn = UNIVERSES.get(slug)
    if defn is None:
        print(f"[{slug}] unknown universe", file=sys.stderr)
        return 1

    instruments: list[dict] = []
    failures: list[str] = []
    for ticker in defn.tickers:
        result = fetch_ohlcv(ticker, as_of=as_of)
        if result.error is not None or result.ohlcv is None:
            failures.append(f"{ticker}: {result.error}")
            continue
        try:
            instrument = score_instrument(
                ticker=ticker,
                name=_name_from_ticker(ticker),
                universe=slug,
                ohlcv=result.ohlcv,
                as_of=as_of,
            )
        except ValueError as exc:
            # scoring insists on min bars; short data = skip loudly.
            failures.append(f"{ticker}: {exc}")
            continue
        instruments.append(instrument)

    filters = [{"key": k, "label": lbl} for k, lbl in defn.chips]
    snapshot = build_snapshot(
        universe=slug,
        display_name=defn.display_name,
        instruments=instruments,
        filters=filters,
        as_of=as_of,
    )

    if failures:
        for line in failures:
            print(f"[{slug}] SKIP {line}", file=sys.stderr)

    if dry_run:
        print(f"[{slug}] dry-run — {len(instruments)} instruments scored, no write")
        return 0  # dry-run is never non-zero: we're only validating shape.

    current, history = write_snapshot(
        project_root=project_root,
        universe=slug,
        payload=snapshot,
    )
    rel_c = current.relative_to(project_root)
    rel_h = history.relative_to(project_root)
    print(f"[{slug}] wrote {rel_c} ({len(instruments)} instruments)")
    print(f"[{slug}] history {rel_h}")
    return 1 if failures and not instruments else 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="scoring.runner")
    parser.add_argument(
        "--universe",
        action="append",
        default=None,
        help="Run only the given universe (repeatable).",
    )
    parser.add_argument(
        "--project-root",
        type=Path,
        default=Path.cwd(),
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Score without writing snapshot files.",
    )
    args = parser.parse_args(argv)

    as_of = datetime.now(timezone.utc)
    universes = tuple(args.universe) if args.universe else tuple(UNIVERSES.keys())
    exit_code = 0
    for slug in universes:
        rc = _run_universe(
            slug,
            as_of=as_of,
            project_root=args.project_root,
            dry_run=args.dry_run,
        )
        if rc != 0:
            exit_code = 1

    return exit_code


if __name__ == "__main__":
    sys.exit(main())
