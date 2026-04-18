# Layout Patterns

## Page shell

Single-page app; all tabs render into a shared shell.

```
┌─────────────────────────────────────────────────────────────┐
│  Logo  TechTracker  Technical Analysis Dashboard   [Live] 🌓 │  ← Header (sticky)
├─────────────────────────────────────────────────────────────┤
│  [Top 50] [Sector ETFs] [Industry ETFs] ... [Methodology]   │  ← TabBar row 1
│  [Fixed Income] [Broad Market] [Growth/Value] ... [Method.]  │  ← TabBar row 2 (wraps)
├─────────────────────────────────────────────────────────────┤
│  🕒 Last refreshed: Apr 18, 01:11:30 PM                      │  ← Status line
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  [Tab-specific content region]                               │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

Max content width ~1400px, centered with small horizontal padding.

## Screener layout (Top 50 Stocks, ETFs, regional, currencies, commodities, fixed income, broad market, growth/value)

```
[🔍 Search ticker or name...                              ]
[All] [facet1] [facet2] [facet3] ...

┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│ Avg Score     │ │ Strong Buy    │ │ Strong Sell   │ │ Showing       │
│ 6.5           │ │ 4             │ │ 1             │ │ 50 / 50       │
└───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘

Ticker | Score | Signal | Price | 1M % | 3M % | Trend | MA | MACD | RSI ...
---    | ---   | ---    | ---   | ---  | ---  | ---   | ...
(rows — each clickable → TickerDetailModal)
```

## Portfolio Builder layout

```
┌─ Model Portfolios ────────────────────────────────────┐
│ [Late Cycle Expansion] [Stagflation] [Risk-Off] [Reflation]
└───────────────────────────────────────────────────────┘

┌────────────┐ ┌──────────────────────────────────────┐
│ Portfolio  │ │ [🔍 Search...]  [All|Equity|...]    │
│ SCORE 0.0  │ │ Ticker | Score | Signal | ... | [+] │
│ WEIGHT 0%  │ │ (UCITS ETF rows with add buttons)   │
│ HOLDINGS 0 │ │                                      │
│            │ │                                      │
│ [Click +]  │ │                                      │
└────────────┘ └──────────────────────────────────────┘
```

## Signals Hub layout

```
┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        ← 15 universe cards, responsive grid
│Stocks│ │Sector│ │Industry│ │Country│ │Portfolio│
│ 6.5  │ │ 6.9  │ │ 6.7    │ │ 7.4   │ │ 6.8     │
│🟢4 🔴1│ │🟢0🔴0│ │🟢0 🔴0 │ │🟢1 🔴0│ │🟢1 🔴0  │
└──────┘ └──────┘ └──────┘ └──────┘ └──────┘

[Top Buys] [Top Sells] [Momentum] [Heatmap]

┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       ← Top 20 spotlight cards (4 cols)
│ AMD    │ │ 6762.T │ │ 6981.T │ │ STMMI  │
│ 8.3    │ │ 8.3    │ │ 8.3    │ │ 8.3    │
│ +39%   │ │ +19%   │ │ +19%   │ │ +27%   │
└────────┘ └────────┘ └────────┘ └────────┘
```

## Signal Change layout

```
Lookback: [1 Week] [1 Month]

┌─────────┐ ┌─────────┐ ... (15 universe summary cards with ⬆/⬇ counts)
│All Mkts │ │ Stocks  │
│  380    │ │  40     │
│⬆290⬇90 │ │⬆32⬇8    │
└─────────┘ └─────────┘

[🔄 All Changes] [⬆ Upgrades] [⬇ Downgrades]

Ticker | Name | Universe | Previous Signal → Current Signal | Score | 1M Chg
(wide table — 380 rows at 1M lookback)
```

## Analytics layout

```
┌────────────────────────┐ ┌────────────────────────┐
│ Signal Distribution    │ │ Sector Average Scores  │
│ (vertical bar chart)   │ │ (horizontal bar chart) │
└────────────────────────┘ └────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ Score Distribution Histogram                        │
│ (vertical bar chart, buckets 0-1 ... 9-10)          │
└─────────────────────────────────────────────────────┘
```

## Methodology layout

```
┌─ Scoring Scale (0 – 10) ─────────────────────────────┐
│ 8.0–10.0  Strong Buy   "Multiple indicators ..."     │
│ 6.5–7.9   Buy          "Majority bullish ..."        │
│ 5.0–6.4   Neutral      "Balanced ..."                │
│ 3.5–4.9   Sell         "Majority bearish ..."        │
│ 0.0–3.4   Strong Sell  "Multiple indicators ..."     │
└──────────────────────────────────────────────────────┘

┌─ Weight Presets (0/5 saved) ─────────────────────────┐
│ [Default] [Momentum] [Trend Following] [Mean Rev.]   │
│ [💾 Save Current]                                    │
└──────────────────────────────────────────────────────┘

┌─ Indicator Weights — Total 100% ─────────────────────┐
│ MA Trend    ▓▓▓▓▓▓░░░░  18%                          │
│ MACD        ▓▓▓▓▓░░░░░  15%                          │
│ ... 9 sliders total                                  │
└──────────────────────────────────────────────────────┘

┌─ CLI Commands ───────────────────────────────────────┐
│ `python sp500_technical_framework.py` — Top 50       │
│ ... 5 commands                                       │
└──────────────────────────────────────────────────────┘
```

## Responsive patterns

- Observed viewport: 1440×900 desktop — fully populated.
- Inferred behaviour (based on Tailwind conventions used by Lovable):
  - `lg:` breakpoint (≥1024px): 4 KPI cards in a row, full tab labels with icons.
  - `md:` breakpoint (768–1023px): 2 KPI cards per row, tab bar wraps to 3 rows.
  - `sm:` breakpoint (<768px): 1 KPI card per row, tab bar becomes scrollable horizontal strip; table becomes horizontally scrollable.
- Confirm once the replication scaffolds — mark as open question.

## Typography

- Headings: medium-weight sans-serif, brand H1 in ~24px.
- Body: 14px default with `text-muted-foreground` for descriptions.
- Monospace: used for CLI commands (`font-mono`).
