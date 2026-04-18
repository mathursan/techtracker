# Data Models (Inferred)

Reverse-engineered from the screener tables, Signals Hub, Signal Change, Methodology, and ticker detail modal. Typed here as TypeScript interfaces so they drop straight into the replica.

## Core domain

```ts
type Universe =
  | "stocks"            // US Top 50
  | "sector-etfs"
  | "industry-etfs"
  | "country-etfs"
  | "currencies"
  | "commodities"
  | "india"
  | "hong-kong"
  | "singapore"
  | "japan"
  | "europe"
  | "fixed-income"
  | "broad-market"
  | "growth-value"
  | "portfolio-etfs";   // surfaces only in Signals Hub + Portfolio Builder

type Signal = "Strong Buy" | "Buy" | "Neutral" | "Sell" | "Strong Sell";

type IndicatorId =
  | "ma_trend"
  | "macd"
  | "rsi"
  | "adx_dmi"
  | "sar"
  | "bollinger"
  | "stochastic"
  | "obv"
  | "ichimoku";

interface IndicatorDef {
  id: IndicatorId;
  displayName: string;      // "MA Trend", "MACD", ...
  description: string;      // "SMA 20/50/200 position, golden cross, MA stack"
  defaultWeight: number;    // 0–100, sums to 100 across all indicators
}

interface IndicatorScore {
  id: IndicatorId;
  value: number;            // 0–10
}
```

## Instrument row (one per screener cell line)

```ts
interface Instrument {
  ticker: string;           // "AMD", "EWT", "AUDUSD=X", "SI=F", "ADANIPOWER.NS"
  name: string;             // "Advanced Micro Devices, Inc."
  universe: Universe;
  sector?: string;          // sector chip label, when applicable
  country?: string;         // Country ETFs only; contains flag emoji + name
  aum?: string;             // e.g. "$10.2B" — present on ETF universes
  ter?: number;             // Industry ETFs only; expense ratio %
  price: number;            // latest close
  perfOneMonth: number;     // percent change, signed
  perfThreeMonth: number;   // percent change, signed
  perfOneYear?: number;     // appears in detail modal
  sparkline: number[];      // daily closes for Trend column (likely 60–90 pts)
  indicators: IndicatorScore[]; // 9 entries
  compositeScore: number;   // 0–10, weighted by weight preset
  signal: Signal;           // derived from compositeScore bands
  previousSignal?: Signal;  // set when lookback differs (Signal Change)
  asOf: string;             // ISO timestamp of snapshot
}
```

## Universe summary (used by Signals Hub + Signal Change)

```ts
interface UniverseSummary {
  universe: Universe;
  displayName: string;       // "Top 50 Stocks", "Sector ETFs", ...
  totalCount: number;
  avgScore: number;          // 0–10
  strongBuyCount: number;
  strongSellCount: number;
  upgrades?: number;         // Signal Change only
  downgrades?: number;       // Signal Change only
  filters: { key: string; label: string }[]; // chip row
}
```

## Scoring configuration (Methodology)

```ts
type WeightPresetId = "default" | "momentum" | "trend-following" | "mean-reversion" | `user-${string}`;

interface WeightPreset {
  id: WeightPresetId;
  name: string;
  weights: Record<IndicatorId, number>; // sums to 100 (UI normalizes)
  isUserSaved?: boolean;
}

interface ScoringConfig {
  bands: {
    strongBuy: [number, number];   // [8.0, 10.0]
    buy: [number, number];         // [6.5, 7.9]
    neutral: [number, number];     // [5.0, 6.4]
    sell: [number, number];        // [3.5, 4.9]
    strongSell: [number, number];  // [0.0, 3.4]
  };
  presets: WeightPreset[];
  activePresetId: WeightPresetId;
}
```

## Portfolio builder

```ts
interface PortfolioHolding {
  ticker: string;
  weight: number;            // 0–100
}

type WeightingMode = "equal" | "custom"; // UI shows "Equal" now; custom inferred

interface ModelPortfolio {
  id: string;
  emoji: string;             // "🔄" | "🔥" | "🛡️" | "🚀"
  name: string;              // "Late Cycle Expansion" etc.
  tagline: string;           // "Quality equity, short duration, gold"
  holdings: PortfolioHolding[];
}

interface UserPortfolio {
  holdings: PortfolioHolding[];
  weightingMode: WeightingMode;
  compositeScore: number;    // derived: weighted average of instrument scores
  totalWeight: number;       // should equal 100
}
```

## Signal change event

```ts
type Lookback = "1W" | "1M";

interface SignalChange {
  ticker: string;
  name: string;
  universe: Universe;
  previousSignal: Signal;
  currentSignal: Signal;
  score: number;
  periodChange: number;     // matches lookback: 1W or 1M %
}
```

## Ticker detail modal payload

```ts
type Timeframe = "1M" | "3M" | "6M" | "1Y" | "2Y" | "5Y";
type ChartKind = "price-ma" | "rsi" | "macd" | "bollinger" | "stochastic" | "volume" | "radar";

interface PricePoint { date: string; close: number; sma20?: number; sma50?: number; sma200?: number; }
interface IndicatorSeries { date: string; value: number; signal?: number; histogram?: number; }

interface TickerDetail extends Instrument {
  history: Record<Timeframe, {
    priceMa: PricePoint[];
    rsi: IndicatorSeries[];
    macd: IndicatorSeries[];
    bollinger: { date: string; close: number; upper: number; middle: number; lower: number }[];
    stochastic: { date: string; k: number; d: number }[];
    volume: { date: string; volume: number }[];
  }>;
  radar: { indicator: IndicatorId; score: number; weight: number }[]; // Radar chart
}
```

## Snapshot envelope (what the scoring job writes)

```ts
interface ScoreSnapshot {
  asOf: string;              // ISO timestamp
  universe: Universe;
  instruments: Instrument[];
  summary: UniverseSummary;
}
```

One JSON file per universe, published to `/public/data/<universe>.json`. The Signals Hub + Signal Change views aggregate across all files.

## Validation / invariants

- `compositeScore` ∈ [0, 10].
- `signal` derived from bands (single source of truth in shared util).
- Sum of indicator weights in any preset = 100 (normalize on load).
- `sparkline` length consistent per universe; missing points imputed with previous close.
- Flag emoji stored separately from `country` name for a11y-safe rendering.
