"""Entry point for the scoring pipeline.

Usage:
    python -m scoring.runner                    # all universes
    python -m scoring.runner --universe stocks  # one universe
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

from .scorer import placeholder_snapshot
from .snapshots import write_snapshot

DEFAULT_UNIVERSES = (
    "stocks",
    "sector-etfs",
    "industry-etfs",
    "country-etfs",
    "currencies",
    "commodities",
    "india",
    "hong-kong",
    "singapore",
    "japan",
    "europe",
    "fixed-income",
    "broad-market",
    "growth-value",
    "portfolio-etfs",
)


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
    args = parser.parse_args(argv)

    universes = tuple(args.universe) if args.universe else DEFAULT_UNIVERSES
    failures: list[str] = []
    for universe in universes:
        try:
            payload = placeholder_snapshot(universe)
            current, history = write_snapshot(
                args.project_root, universe, payload
            )
            print(
                f"[{universe}] wrote {current.relative_to(args.project_root)}"
            )
            print(
                f"[{universe}] history {history.relative_to(args.project_root)}"
            )
        except (OSError, ValueError) as exc:
            # Boundary: report and continue. Programmer errors (ImportError,
            # AttributeError, TypeError, …) intentionally propagate so the
            # workflow fails loudly.
            print(f"[{universe}] FAILED: {exc}", file=sys.stderr)
            failures.append(universe)

    if failures:
        print(f"\nFAILED universes: {', '.join(failures)}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
