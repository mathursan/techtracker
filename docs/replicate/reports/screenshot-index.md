# Screenshot Index

All screenshots captured from https://st-technical-analysis.lovable.app on 2026-04-18. See `docs/replicate/screenshots/` for raw PNGs and `docs/replicate/artifacts/screenshots/` for the exploration script's intermediate captures.

## Primary screen captures

| File | Route / State | Description | Key UI elements |
|---|---|---|---|
| `home_fullpage.png` | `/` (Top 50 Stocks) | Default landing view | Horizontal tab nav, sector chips, 4 KPI cards, 50-row screener table |
| `tab_sector_etfs.png` | Sector ETFs | SPDR sector screener | Adds `AUM` column; 11 rows; sector chips |
| `tab_industry_etfs.png` | Industry ETFs | Industry ETF screener | Adds `AUM` + `TER` columns; 24 rows; industry chips |
| `tab_country_etfs.png` | Country ETFs | Global country ETF screener | Adds `Country` column with flag emojis; 26 rows; regional chips |
| `tab_currencies.png` | Currencies | FX pair screener | 15 rows; Cross/EM/Major chips |
| `tab_commodities.png` | Commodities | Futures screener | 12 rows; Agriculture/Energy/Metals chips |
| `tab_india.png` | India | NSE equity screener | 50 rows; `.NS` tickers |
| `tab_portfolio_builder.png` | Portfolio Builder | Custom allocation tool | 4 preset cards, weight mode, portfolio panel, UCITS ETF table with `+` add buttons |
| `tab_signals_hub.png` | Signals Hub | Cross-universe signal digest | 15 universe summary cards, Top Buys / Top Sells / Momentum / Heatmap views, top-signal cards |
| `tab_signal_change.png` | Signal Change | Signal upgrades/downgrades | 1W / 1M lookback, per-universe change counts, wide table with `Previous → Current` signal columns |
| `tab_analytics.png` | Analytics | Summary charts | Signal Distribution bar chart, Sector Average Scores horizontal bars, Score Distribution Histogram |
| `tab_methodology.png` | Methodology | Scoring documentation | Scoring bands, 4 weight presets + Save, 9 indicator-weight sliders with descriptions, CLI reference |
| `detail_amd_modal.png` | Ticker detail (AMD) | Stock drill-down modal | Header with score/signal/price/1M/3M/1Y, timeframe tabs (1M/3M/6M/1Y/2Y/5Y), chart-kind tabs (Price+MA / RSI / MACD / Bollinger / Stochastic / Volume / Radar), 9 indicator score bars with weights |
| `dark_mode.png` | `/` (light theme shown) | Theme toggle was clicked but visual toggle did not take — treated as open question in component catalog |

## Raw exploration captures

Approximately 50 additional screenshots from `interactive-explorer.py` and `comprehensive-explorer.py` live at `docs/replicate/artifacts/screenshots/`. They capture before/after states for every clickable nav button, plus fallback captures of common routes (all return the SPA shell).
