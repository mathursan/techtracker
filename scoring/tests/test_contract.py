"""Contract: TS bands must produce the same signal as Python bands for
every score in a shared fixture grid."""
from __future__ import annotations

import json
import subprocess
from pathlib import Path

import pytest

from scoring.domain.bands import signal_for_score

FIXTURE_PATH = (
    Path(__file__).resolve().parents[2]
    / "src"
    / "domain"
    / "__fixtures__"
    / "band-grid.json"
)

GRID = [round(0.1 * i, 1) for i in range(0, 101)]  # 0.0 .. 10.0 inclusive


def test_fixture_exists_and_covers_grid() -> None:
    assert FIXTURE_PATH.exists(), (
        f"Missing fixture at {FIXTURE_PATH} — regenerate with "
        "`pnpm exec tsx src/domain/__fixtures__/generate.ts`."
    )
    fixture = json.loads(FIXTURE_PATH.read_text())
    assert isinstance(fixture, list)
    assert len(fixture) == len(GRID)


def test_python_matches_fixture() -> None:
    fixture = json.loads(FIXTURE_PATH.read_text())
    by_score = {row["score"]: row["signal"] for row in fixture}
    for score in GRID:
        assert signal_for_score(score) == by_score[score], score


@pytest.mark.skipif(
    not (Path(__file__).resolve().parents[2] / "node_modules").exists(),
    reason="node_modules not installed; skipping TS regeneration check",
)
def test_fixture_is_current() -> None:
    result = subprocess.run(
        [
            "pnpm",
            "exec",
            "tsx",
            str(
                Path(__file__).resolve().parents[2]
                / "src"
                / "domain"
                / "__fixtures__"
                / "generate.ts"
            ),
            "--check",
        ],
        cwd=Path(__file__).resolve().parents[2],
        capture_output=True,
        text=True,
        timeout=60,
    )
    assert result.returncode == 0, (
        f"Fixture is stale. Regenerate:\n{result.stdout}\n{result.stderr}"
    )
