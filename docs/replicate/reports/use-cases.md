# Use Cases

The source app has a single actor — **Guest (anonymous user)**. No authentication, no roles. One implicit actor — the **Scoring Pipeline** — publishes the data.

## Index

| ID | Title | Actor | Priority |
|---|---|---|---|
| UC-01 | Browse a universe in the screener | Guest | P0 |
| UC-02 | Filter the screener by sector/facet chip | Guest | P0 |
| UC-03 | Search within a universe by ticker / name | Guest | P0 |
| UC-04 | Sort screener by any column | Guest | P0 |
| UC-05 | Open ticker detail modal with charts | Guest | P0 |
| UC-06 | View Signals Hub (Top Buys / Sells / Momentum / Heatmap) | Guest | P1 |
| UC-07 | View Signal Change (upgrades / downgrades, 1W / 1M) | Guest | P1 |
| UC-08 | Load a preset model portfolio | Guest | P1 |
| UC-09 | Build a custom portfolio (add assets, weight) | Guest | P1 |
| UC-10 | View Analytics (signal distribution, sector averages, histogram) | Guest | P2 |
| UC-11 | Switch/customize/save indicator weight presets | Guest | P2 |
| UC-12 | Toggle light/dark theme | Guest | P2 |
| UC-13 | See data freshness ("Last refreshed") | Guest | P1 |
| UC-14 | Navigate between 19 top-level tabs | Guest | P0 |
| UC-15 | Scoring pipeline publishes snapshots | Scoring Pipeline | P0 |

Individual use-case files live under `docs/replicate/analysis/uc-*.md`. Each one will be filed as its own GitHub issue in phase 10.

## Completeness check

| Source tab | Covered by |
|---|---|
| Top 50 Stocks | UC-01, UC-02, UC-03, UC-04, UC-05 |
| Sector ETFs | UC-01, UC-02, UC-04, UC-05 |
| Industry ETFs | UC-01, UC-02, UC-04, UC-05 |
| Country ETFs | UC-01, UC-02, UC-04, UC-05 |
| Currencies | UC-01, UC-02, UC-04, UC-05 |
| Commodities | UC-01, UC-02, UC-04, UC-05 |
| India / HK / SG / JP / Europe | UC-01, UC-02, UC-04, UC-05 |
| Fixed Income | UC-01, UC-02, UC-04, UC-05 |
| Broad Market | UC-01, UC-02, UC-04, UC-05 |
| Growth/Value | UC-01, UC-02, UC-04, UC-05 |
| Portfolio Builder | UC-08, UC-09 |
| Signals Hub | UC-06 |
| Signal Change | UC-07 |
| Analytics | UC-10 |
| Methodology | UC-11 |
| Header theme toggle | UC-12 |
| Last refreshed line | UC-13 |
| Tab bar navigation | UC-14 |
| (offline) | UC-15 |

All 19 tabs + shell affordances are covered.
