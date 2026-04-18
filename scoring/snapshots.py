"""Write per-universe JSON snapshots + rolling history.

Called by runner.py. Retention window is 35 days so UC-07 Signal Change
(1-month lookback) always has data.
"""
from __future__ import annotations

import json
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

HISTORY_DAYS = 35


def write_snapshot(
    project_root: Path,
    universe: str,
    payload: dict[str, Any],
    *,
    now: datetime | None = None,
) -> tuple[Path, Path]:
    """Write current + history snapshot for a universe."""
    now = now or datetime.now(timezone.utc)
    data_dir = project_root / "public" / "data"
    history_dir = data_dir / "history" / universe
    data_dir.mkdir(parents=True, exist_ok=True)
    history_dir.mkdir(parents=True, exist_ok=True)

    current_path = data_dir / f"{universe}.json"
    history_path = history_dir / f"{now.date().isoformat()}.json"

    text = json.dumps(payload, indent=2, sort_keys=True)
    current_path.write_text(text + "\n", encoding="utf-8")
    history_path.write_text(text + "\n", encoding="utf-8")

    _prune_history(history_dir, now=now)
    return current_path, history_path


def _prune_history(history_dir: Path, *, now: datetime) -> None:
    cutoff = (now - timedelta(days=HISTORY_DAYS)).date()
    for entry in history_dir.glob("*.json"):
        try:
            stamp = datetime.fromisoformat(entry.stem).date()
        except ValueError:
            continue
        if stamp < cutoff:
            entry.unlink()
