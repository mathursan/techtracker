#!/usr/bin/env node
/**
 * Writes a deterministic fixture snapshot to `public/data/stocks.json` so
 * E2E tests (and local dev) have something for the screener to render
 * without booting the Python scoring pipeline.
 *
 *   node scripts/seed-e2e-data.mjs
 *
 * Called by `pnpm test:e2e` before Playwright spins up the web server.
 *
 * Internal consistency rules:
 *  - Signal derives from composite score via the same band logic as
 *    src/domain/bands.ts (kept in sync manually; if you edit one, edit
 *    both).
 *  - Indicator sub-scores cluster around the composite (±1.2) so the row
 *    reads as a coherent call, not a random-noise fixture a reviewer can
 *    dismiss.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, "..", "public", "data", "stocks.json");

const asOf = new Date("2026-04-19T20:30:00Z").toISOString();

// Order matches src/domain/types.ts::INDICATOR_IDS — kept in sync manually.
const INDICATOR_IDS = [
  "ma_trend",
  "macd",
  "adx_dmi",
  "rsi",
  "sar",
  "bollinger",
  "stochastic",
  "obv",
  "ichimoku",
];

// Same band logic as src/domain/bands.ts::signalForScore. If one drifts,
// the contract test doesn't cover this JS surface — so they're kept
// synced by hand and comment-flagged.
function signalForScore(score) {
  const clamped = Math.max(0, Math.min(10, score));
  if (clamped >= 8.0) return "Strong Buy";
  if (clamped >= 6.5) return "Buy";
  if (clamped >= 5.0) return "Neutral";
  if (clamped >= 3.5) return "Sell";
  return "Strong Sell";
}

const TICKERS = [
  { t: "AAPL", n: "Apple Inc.", p: 234.12, m1: 8.45, m3: 15.2, comp: 7.2 },
  { t: "MSFT", n: "Microsoft Corporation", p: 425.91, m1: 12.3, m3: 22.8, comp: 8.4 },
  { t: "NVDA", n: "NVIDIA Corporation", p: 138.55, m1: 18.7, m3: 35.4, comp: 8.9 },
  { t: "AMZN", n: "Amazon.com Inc.", p: 198.04, m1: 4.2, m3: 9.1, comp: 6.8 },
  { t: "META", n: "Meta Platforms Inc.", p: 583.21, m1: 9.8, m3: 18.3, comp: 7.4 },
  { t: "INTC", n: "Intel Corporation", p: 21.45, m1: -12.5, m3: -25.8, comp: 2.8 },
  { t: "XOM", n: "Exxon Mobil Corporation", p: 109.88, m1: -4.1, m3: -8.3, comp: 3.9 },
  { t: "KO", n: "The Coca-Cola Company", p: 68.45, m1: 1.2, m3: 3.4, comp: 5.5 },
  { t: "DIS", n: "The Walt Disney Company", p: 102.78, m1: -1.8, m3: 2.1, comp: 5.1 },
  { t: "GS", n: "Goldman Sachs Group Inc.", p: 585.23, m1: 6.5, m3: 14.7, comp: 7.1 },
];

function seededIndicatorsAround(composite, seed) {
  // Linear-congruential generator with a stable seed; every indicator
  // lands in [composite - 1.2, composite + 1.2], clamped to [0, 10].
  let x = seed;
  return INDICATOR_IDS.map((id) => {
    x = (x * 9301 + 49297) % 233280;
    const delta = (x / 233280 - 0.5) * 2.4; // [-1.2, +1.2]
    const value = Math.max(0, Math.min(10, composite + delta));
    return { id, value: Math.round(value * 10) / 10 };
  });
}

function sparkline(seed, trendSign) {
  const pts = [];
  let v = 100;
  for (let i = 0; i < 60; i++) {
    v += trendSign * 0.2 + (Math.sin(seed + i) + Math.cos(seed * 0.7 + i * 2)) * 0.6;
    pts.push(Math.round(v * 100) / 100);
  }
  return pts;
}

const instruments = TICKERS.map((spec, idx) => ({
  ticker: spec.t,
  name: spec.n,
  universe: "stocks",
  price: spec.p,
  perfOneMonth: spec.m1,
  perfThreeMonth: spec.m3,
  sparkline: sparkline(idx + 13, spec.m1 / 5),
  indicators: seededIndicatorsAround(spec.comp, idx + 17),
  compositeScore: spec.comp,
  signal: signalForScore(spec.comp),
  asOf,
}));

const snapshot = {
  asOf,
  universe: "stocks",
  instruments,
  summary: {
    universe: "stocks",
    displayName: "Top 50 Stocks",
    totalCount: instruments.length,
    avgScore:
      Math.round(
        (instruments.reduce((s, i) => s + i.compositeScore, 0) / instruments.length) * 100,
      ) / 100,
    strongBuyCount: instruments.filter((i) => i.signal === "Strong Buy").length,
    strongSellCount: instruments.filter((i) => i.signal === "Strong Sell").length,
    filters: [
      { key: "all", label: "All" },
      { key: "tech", label: "Information Technology" },
      { key: "financials", label: "Financials" },
    ],
  },
};

await mkdir(dirname(outFile), { recursive: true });
await writeFile(outFile, JSON.stringify(snapshot, null, 2) + "\n", "utf-8");
console.log(`Wrote ${outFile} (${instruments.length} instruments)`);
