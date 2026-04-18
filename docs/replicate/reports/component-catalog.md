# Component Catalog

Visual components inventoried from the TechTracker UI. Organized for mapping onto a shadcn/ui + Tailwind implementation.

## Layout shell

- **AppHeader**: logo + brand (`TechTracker`) + subtitle (`Technical Analysis Dashboard`) + `Live` pill + theme icon button.
- **TabBar**: two-row horizontal button bar grouping 19 top-level tabs. On narrower viewports the tabs should wrap; icons sit to the left of labels. Active tab is filled-primary; inactive is ghost.
- **StatusLine**: `Last refreshed: Apr 18, 01:11:30 PM` with clock icon; sits under the tab bar in all screener-style views.

## Navigation

- **Primary tabs** (client-side routes, stored in URL or state): `Top 50 Stocks`, `Sector ETFs`, `Industry ETFs`, `Country ETFs`, `Currencies`, `Commodities`, `India`, `Hong Kong`, `Singapore`, `Japan`, `Europe`, `Fixed Income`, `Broad Market`, `Growth/Value`, `Portfolio Builder`, `Signals Hub`, `Signal Change`, `Analytics`, `Methodology`.
- **Filter chip row**: pill buttons above each screener with an `All` default and contextual facets (sectors, regions, asset style, etc.).

## KPI / summary cards

- **StatCard**: label on top (`Avg Score`, `Strong Buy`, `Strong Sell`, `Showing`), large value below. Used on every screener.
- **UniverseStatCard** (Signals Hub): universe name, average score, green/red signal counts, `N total`.
- **SignalChangeCard** (Signal Change): universe name, total changes, ⬆ / ⬇ counts.
- **TickerSpotlightCard** (Signals Hub top buys/sells): ticker, company name, score badge, signal badge, universe tag, % change.

## Data grid

- **ScreenerTable**: sortable headers (up/down caret icons), sticky header behaviour implied by scroll.
  - Core columns across all screeners: `Ticker`, `Score`, `Signal`, `Price`, `1M %`, `3M %`, `Trend` (sparkline), then 9 indicator columns: `MA Trend`, `MACD`, `RSI`, `ADX/DMI`, `SAR`, `Bollinger`, `Stochastic`, `OBV`, `Ichimoku`.
  - Universe-specific extras: `AUM` (Sector/Industry/Broad/Growth), `TER` (Industry), `Country` (Country ETFs, with flag emoji).
  - Ticker cell renders symbol with smaller company name beneath. Flag emoji sits before symbol in Country ETFs.
- **TrendSparkline**: SVG line chart, 60–90 days of closes, colored green for positive net change, red for negative. No axis labels.
- **SignalBadge**: pill; colors — Strong Buy = solid green, Buy = soft green, Neutral = amber/yellow, Sell = soft red, Strong Sell = solid red.
- **IndicatorScoreCell**: numeric with color gradient (green ≥ 7, amber 4–6.9, red < 4).

## Inputs

- **SearchInput**: ticker/name search with magnifier icon, full-width above the table.
- **FilterChip**: toggle button; one active at a time per row.
- **LookbackToggle** (Signal Change): two-button toggle (`1 Week` / `1 Month`).
- **WeightPresetChips** (Methodology): single-select pill group (`Default`, `Momentum Focus`, `Trend Following`, `Mean Reversion`) + `Save Current` action.
- **WeightSlider** (Methodology): labeled slider 0–100 with live-total normalization; description text beside each name.

## Portfolio Builder specifics

- **ModelPortfolioCard**: emoji + name + one-liner + asset count; click to load preset. Four presets: `Late Cycle Expansion`, `Stagflation Hedge`, `Risk-Off / Recession`, `Reflation / Commodity Bull`.
- **PortfolioPanel**: sticky sidebar showing composite `SCORE`, `WEIGHT` %, `HOLDINGS (N)`. Empty state: `Click + on the table to add assets`.
- **WeightingModeToggle**: `Equal` weighting button (extension point for custom weights).
- **AddAssetButton**: `+` icon cell at right of each row in the builder table.

## Modals

- **TickerDetailModal**: centered fixed dialog (Radix Dialog), close `X` top-right, scroll-inside-modal.
  - Header: ticker, company, sector, score badge, signal badge, price + 1M / 3M / 1Y % chips.
  - `TimeframeTabs`: `1M | 3M | 6M | 1Y | 2Y | 5Y`.
  - `ChartKindTabs`: `Price + MA | RSI | MACD | Bollinger | Stochastic | Volume | Radar`.
  - Chart area: Recharts line+line/bar charts with date x-axis and value y-axis.
  - `IndicatorScoresPanel`: 9 bars with name, score, weight %; legend `0 Strong Sell / 5 Neutral / 10 Strong Buy`.

## Analytics charts

- **SignalDistributionBarChart**: vertical bar chart — Buy / Neutral / Sell / Strong Buy / Strong Sell.
- **SectorAverageScoreBarChart**: horizontal bar chart, 11 sector rows.
- **ScoreDistributionHistogram**: vertical histogram across 0–1, 1–2, … 9–10 buckets.

## Typography & theming

- Font stack: system-default (Lovable default). Brand H1 uses regular weight, muted subtitle sits beside it.
- Color cues: green for bullish / positive, red for bearish / negative, amber for neutral.
- Theme toggle icon exists top-right; the current implementation may not persist a dark mode (observed: icon click did not flip theme in our session — treat as **open question** for replication).

## Open questions

1. Does the app persist user state (selected tab, custom portfolios, saved weight presets) to localStorage/backend? The `0/5 saved` label on Weight Presets implies yes.
2. What triggers `Last refreshed`? Fetch on load only, or polling?
3. Ticker detail modal — is every row clickable, or only some? (Confirmed clickable on Top 50; assume same elsewhere.)
