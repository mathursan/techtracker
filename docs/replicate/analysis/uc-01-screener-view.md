---
id: UC-01
title: Browse a universe in the screener
actor: Guest
priority: P0
category: Screener
labels: ["feature", "screener", "P0"]
related_use_cases: [UC-02, UC-03, UC-04, UC-05, UC-13, UC-15]
screenshots:
  - docs/replicate/screenshots/home_fullpage.png
  - docs/replicate/screenshots/tab_sector_etfs.png
  - docs/replicate/screenshots/tab_country_etfs.png
---

## Summary
Render a sortable, searchable, filterable screener table for a given universe (Top 50 Stocks, Sector ETFs, Industry ETFs, Country ETFs, Currencies, Commodities, India, Hong Kong, Singapore, Japan, Europe, Fixed Income, Broad Market, Growth/Value). This is the core view of the product — 13 of the 19 top-level tabs use this layout.

## Preconditions
- A scoring snapshot for the selected universe is available (see UC-15).
- User has navigated to the tab for that universe.

## Flow
1. User clicks a tab (e.g. `Sector ETFs`).
2. App loads the snapshot for that universe (UC-15 output).
3. App renders 4 KPI cards across the top: `Avg Score`, `Strong Buy`, `Strong Sell`, `Showing N / total`.
4. App renders a filter-chip row above the table: `All` + universe-specific facets (see chips table below).
5. App renders the screener table, unsorted by default (ordered by composite score descending).

## Postconditions
- The table is populated, sortable, and clickable.
- URL reflects the active universe (`?universe=sector-etfs` or `/sector-etfs`, replica choice).

## Column schema

Base columns (always present):
`Ticker`, `Score`, `Signal`, `Price`, `1M %`, `3M %`, `Trend` (sparkline), `MA Trend`, `MACD`, `RSI`, `ADX/DMI`, `SAR`, `Bollinger`, `Stochastic`, `OBV`, `Ichimoku`.

Universe-specific extras:
| Universe | Extra columns | Chip row | Row count (observed) |
|---|---|---|---|
| Top 50 Stocks | — | sector names (11) | 50 |
| Sector ETFs | AUM | sector names (11) | 11 |
| Industry ETFs | AUM, TER | industry names (10) | 24 |
| Country ETFs | Country (with flag) | Africa, Americas, Asia Pac Dev, Asia Pac EM, Europe Dev, Middle East | 26 |
| Currencies | — | Cross, EM, Major | 15 |
| Commodities | — | Agriculture, Energy, Industrial Metals, Precious Metals | 12 |
| India | — | sector names (10) | 50 |
| Hong Kong | — | EV/Industrial, Energy/SOEs, Financials, Healthcare, High Beta, Property, Tech/Internet | 40 |
| Singapore | — | Airlines/Travel, Banks, Consumer, High Beta, Industrials, Property, REITs, Telecom/Tech | 24 |
| Japan | — | Autos, Consumer, Electronics, Energy, Financials, Industrials, Materials, Pharma, Real Estate, Telecom, Trading | 67 |
| Europe | — | France, Germany, Italy, Netherlands, Nordics, Spain, Switzerland, UK | 73 |
| Fixed Income | — | Agency, Aggregate, Convertible, Corporate, Emerging Markets, Floating Rate/Loans, Government, Inflation-Protected, International, Mortgage-Backed, Municipal, Preferred, Short Duration | 26 |
| Broad Market | AUM | Emerging Markets, Equal Weight, Global, Global ex-US, Low Volatility, Momentum, Multi-Factor, Quality, Regional Broad, UCITS, US Large Cap, US Total Market, Value | 30 |
| Growth/Value | AUM | Large Cap, Mega Cap, Mid Cap, Russell 1000, Russell 2000, S&P 500, Small Cap | 21 |

## Acceptance criteria
- [ ] Each of the 13 screener tabs renders the base 16 columns plus its universe-specific extras.
- [ ] KPI cards show correct `Avg Score`, `Strong Buy`, `Strong Sell` counts, and `Showing` ratio that updates with filters.
- [ ] Rows default-sort by composite score descending.
- [ ] Ticker cell shows symbol + smaller company/pair/futures name.
- [ ] Score cell colors match signal bands (UC-11 thresholds).
- [ ] Signal badge uses the shared color map (Strong Buy green, Buy light green, Neutral amber, Sell soft red, Strong Sell solid red).
- [ ] Trend sparkline is green when `1M %` is positive, red when negative.
- [ ] Indicator cells (0–10) colored: green ≥ 7, amber 4–6.9, red < 4.
- [ ] Switching tabs does not lose unrelated state (search term scoped per tab, filter chip reset OK).

## Technical notes
- Data loaded from `/public/data/<universe>.json` (one snapshot per universe).
- Table sorting/searching must happen client-side (no XHR after initial load).
- See UC-04 for sort behaviour and UC-02 for chip filter behaviour.
