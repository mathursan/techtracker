"""TechTracker scoring package.

Publishes per-universe JSON snapshots consumed by the Next.js frontend.
Rules (score-to-signal mapping, composite weighting) are mirrored in
src/domain/ on the TS side and gated by scoring/tests/test_contract.py.
"""

__version__ = "0.1.0"
