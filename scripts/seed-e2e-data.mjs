#!/usr/bin/env node
/**
 * Writes deterministic fixture snapshots to `public/data/<universe>.json`
 * so E2E tests (and local dev) have cross-universe data for the screener
 * and the Signals Hub without booting the Python scoring pipeline.
 *
 *   node scripts/seed-e2e-data.mjs
 *
 * Called by `pnpm test:e2e` and `pnpm seed:e2e`.
 *
 * Internal consistency rules:
 *  - Signal derives from composite score via the same band logic as
 *    src/domain/bands.ts (kept in sync manually; if you edit one, edit
 *    both).
 *  - Composite derives from indicator sub-scores via the weighted mean
 *    over DEFAULT_WEIGHTS (same as src/domain/composite.ts). No drift
 *    between the row-level score and the breakdown shown in the detail
 *    modal.
 *  - Indicator sub-scores cluster around a target (±1.2) so each row
 *    reads as a coherent call, not random noise.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = resolve(here, "..", "public", "data");

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

// Default indicator weights — MUST stay in sync with src/domain/composite.ts
// DEFAULT_WEIGHTS so the derived composite in this seed matches what the
// screener + detail modal display.
const DEFAULT_WEIGHTS = {
  ma_trend: 18,
  macd: 15,
  adx_dmi: 13,
  rsi: 12,
  sar: 10,
  bollinger: 10,
  stochastic: 10,
  obv: 7,
  ichimoku: 5,
};

function seededIndicatorsAround(target, seed) {
  let x = seed;
  return INDICATOR_IDS.map((id) => {
    x = (x * 9301 + 49297) % 233280;
    const delta = (x / 233280 - 0.5) * 2.4; // [-1.2, +1.2]
    const value = Math.max(0, Math.min(10, target + delta));
    return { id, value: Math.round(value * 10) / 10 };
  });
}

function weightedComposite(indicators) {
  const byId = Object.fromEntries(indicators.map((i) => [i.id, i.value]));
  const total = INDICATOR_IDS.reduce((s, id) => s + DEFAULT_WEIGHTS[id], 0);
  const weighted = INDICATOR_IDS.reduce(
    (s, id) => s + (DEFAULT_WEIGHTS[id] / total) * (byId[id] ?? 0),
    0,
  );
  return Math.round(weighted * 10) / 10;
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

function buildSnapshot({ universe, displayName, filters, tickers, seedBase }) {
  const instruments = tickers.map((spec, idx) => {
    const indicators = seededIndicatorsAround(spec.comp, seedBase + idx);
    const compositeScore = weightedComposite(indicators);
    return {
      ticker: spec.t,
      name: spec.n,
      universe,
      price: spec.p,
      perfOneMonth: spec.m1,
      perfThreeMonth: spec.m3,
      perfOneYear: spec.m12,
      sparkline: sparkline(seedBase + idx, spec.m1 / 5),
      indicators,
      compositeScore,
      signal: signalForScore(compositeScore),
      tags: spec.tags ?? [],
      asOf,
    };
  });

  return {
    asOf,
    universe,
    instruments,
    summary: {
      universe,
      displayName,
      totalCount: instruments.length,
      avgScore:
        instruments.length === 0
          ? 0
          : Math.round(
              (instruments.reduce((s, i) => s + i.compositeScore, 0) / instruments.length) * 100,
            ) / 100,
      strongBuyCount: instruments.filter((i) => i.signal === "Strong Buy").length,
      strongSellCount: instruments.filter((i) => i.signal === "Strong Sell").length,
      filters,
    },
  };
}

const UNIVERSES = [
  {
    universe: "stocks",
    displayName: "Top 50 Stocks",
    seedBase: 17,
    filters: [
      { key: "all", label: "All" },
      { key: "comm-services", label: "Communication Services" },
      { key: "cons-staples", label: "Consumer Staples" },
      { key: "energy", label: "Energy" },
      { key: "financials", label: "Financials" },
      { key: "tech", label: "Information Technology" },
    ],
    tickers: [
      { t: "AAPL", n: "Apple Inc.", p: 234.12, m1: 8.45, m3: 15.2, m12: 38.5, comp: 7.2, tags: ["tech"] },
      { t: "MSFT", n: "Microsoft Corporation", p: 425.91, m1: 12.3, m3: 22.8, m12: 45.1, comp: 8.4, tags: ["tech"] },
      { t: "NVDA", n: "NVIDIA Corporation", p: 138.55, m1: 18.7, m3: 35.4, m12: 142.2, comp: 8.9, tags: ["tech"] },
      { t: "AMZN", n: "Amazon.com Inc.", p: 198.04, m1: 4.2, m3: 9.1, m12: 22.3, comp: 6.8, tags: ["tech"] },
      { t: "META", n: "Meta Platforms Inc.", p: 583.21, m1: 9.8, m3: 18.3, m12: 65.7, comp: 7.4, tags: ["tech"] },
      { t: "INTC", n: "Intel Corporation", p: 21.45, m1: -12.5, m3: -25.8, m12: -48.9, comp: 2.8, tags: ["tech"] },
      { t: "XOM", n: "Exxon Mobil Corporation", p: 109.88, m1: -4.1, m3: -8.3, m12: -3.2, comp: 3.9, tags: ["energy"] },
      { t: "KO", n: "The Coca-Cola Company", p: 68.45, m1: 1.2, m3: 3.4, m12: 7.8, comp: 5.5, tags: ["cons-staples"] },
      { t: "DIS", n: "The Walt Disney Company", p: 102.78, m1: -1.8, m3: 2.1, m12: 5.2, comp: 5.1, tags: ["comm-services"] },
      { t: "GS", n: "Goldman Sachs Group Inc.", p: 585.23, m1: 6.5, m3: 14.7, m12: 32.8, comp: 7.1, tags: ["financials"] },
    ],
  },
  {
    universe: "sector-etfs",
    displayName: "Sector ETFs",
    seedBase: 101,
    filters: [{ key: "all", label: "All" }],
    tickers: [
      { t: "XLK", n: "Technology Select Sector SPDR", p: 235.4, m1: 9.1, m3: 17.2, m12: 41.0, comp: 7.9 },
      { t: "XLE", n: "Energy Select Sector SPDR", p: 91.2, m1: -3.5, m3: -6.1, m12: -2.4, comp: 3.8 },
      { t: "XLV", n: "Health Care Select Sector SPDR", p: 148.5, m1: 2.1, m3: 4.7, m12: 11.8, comp: 5.6 },
      { t: "XLF", n: "Financial Select Sector SPDR", p: 49.8, m1: 5.2, m3: 11.4, m12: 24.9, comp: 6.9 },
      { t: "XLY", n: "Consumer Discretionary SPDR", p: 207.3, m1: 4.4, m3: 8.8, m12: 18.2, comp: 6.6 },
      { t: "XLP", n: "Consumer Staples SPDR", p: 81.7, m1: 0.3, m3: 1.1, m12: 3.5, comp: 5.0 },
      { t: "XLI", n: "Industrial Select Sector SPDR", p: 141.2, m1: 3.1, m3: 7.2, m12: 14.5, comp: 6.1 },
      { t: "XLU", n: "Utilities Select Sector SPDR", p: 78.9, m1: -1.2, m3: 0.5, m12: 6.4, comp: 4.8 },
    ],
  },
  {
    universe: "commodities",
    displayName: "Commodities",
    seedBase: 211,
    filters: [{ key: "all", label: "All" }],
    tickers: [
      { t: "GC=F", n: "Gold Futures", p: 2405.3, m1: 6.2, m3: 14.1, m12: 32.4, comp: 8.1 },
      { t: "SI=F", n: "Silver Futures", p: 31.2, m1: 8.4, m3: 19.8, m12: 45.2, comp: 8.6 },
      { t: "CL=F", n: "Crude Oil Futures", p: 72.1, m1: -5.8, m3: -11.2, m12: -8.3, comp: 3.2 },
      { t: "NG=F", n: "Natural Gas Futures", p: 2.84, m1: -14.1, m3: -22.5, m12: -18.6, comp: 2.4 },
      { t: "HG=F", n: "Copper Futures", p: 4.58, m1: 3.2, m3: 8.7, m12: 19.4, comp: 6.5 },
      { t: "ZC=F", n: "Corn Futures", p: 4.21, m1: -2.1, m3: -4.8, m12: -6.5, comp: 4.3 },
    ],
  },
  {
    universe: "india",
    displayName: "India",
    seedBase: 337,
    filters: [{ key: "all", label: "All" }],
    tickers: [
      { t: "RELIANCE.NS", n: "Reliance Industries", p: 2915.5, m1: 4.1, m3: 9.8, m12: 22.3, comp: 6.9 },
      { t: "TCS.NS", n: "Tata Consultancy Services", p: 3842.0, m1: 3.2, m3: 7.5, m12: 18.4, comp: 6.5 },
      { t: "INFY.NS", n: "Infosys Limited", p: 1685.2, m1: 5.8, m3: 12.1, m12: 28.7, comp: 7.3 },
      { t: "HDFCBANK.NS", n: "HDFC Bank", p: 1648.9, m1: 2.4, m3: 5.6, m12: 14.2, comp: 6.1 },
      { t: "ICICIBANK.NS", n: "ICICI Bank", p: 1125.3, m1: 6.1, m3: 13.4, m12: 30.2, comp: 7.4 },
      { t: "SBIN.NS", n: "State Bank of India", p: 812.5, m1: 1.2, m3: 3.4, m12: 8.9, comp: 5.5 },
    ],
  },
  {
    universe: "europe",
    displayName: "Europe",
    seedBase: 463,
    filters: [{ key: "all", label: "All" }],
    tickers: [
      { t: "ASML.AS", n: "ASML Holding NV", p: 685.4, m1: 7.8, m3: 16.2, m12: 38.5, comp: 7.8 },
      { t: "SAP.DE", n: "SAP SE", p: 192.1, m1: 5.4, m3: 11.8, m12: 28.4, comp: 7.2 },
      { t: "MC.PA", n: "LVMH Moët Hennessy", p: 712.9, m1: -2.3, m3: -5.1, m12: 3.4, comp: 4.7 },
      { t: "NESN.SW", n: "Nestlé SA", p: 92.4, m1: -1.8, m3: -3.5, m12: -8.2, comp: 4.1 },
      { t: "NOVN.SW", n: "Novartis AG", p: 96.2, m1: 1.4, m3: 3.8, m12: 11.4, comp: 5.7 },
      { t: "SHEL.L", n: "Shell plc", p: 28.3, m1: -3.8, m3: -7.4, m12: -2.1, comp: 3.7 },
    ],
  },
];

await mkdir(dataDir, { recursive: true });

for (const spec of UNIVERSES) {
  const snap = buildSnapshot(spec);
  const outFile = resolve(dataDir, `${spec.universe}.json`);
  await writeFile(outFile, JSON.stringify(snap, null, 2) + "\n", "utf-8");
  console.log(`Wrote ${outFile} (${snap.instruments.length} instruments)`);
}
