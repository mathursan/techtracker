#!/usr/bin/env node
/**
 * Writes a deterministic fixture snapshot to `public/data/stocks.json` so
 * E2E tests (and local dev) have something for the screener to render
 * without booting the Python scoring pipeline.
 *
 *   node scripts/seed-e2e-data.mjs
 *
 * Called by `pnpm test:e2e` before Playwright spins up the web server.
 */
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, "..", "public", "data", "stocks.json");

const asOf = new Date("2026-04-19T20:30:00Z").toISOString();

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

const TICKERS = [
  { t: "AAPL", n: "Apple Inc.", p: 234.12, m1: 8.45, m3: 15.2, sig: "Buy", comp: 7.2 },
  { t: "MSFT", n: "Microsoft Corporation", p: 425.91, m1: 12.3, m3: 22.8, sig: "Strong Buy", comp: 8.4 },
  { t: "NVDA", n: "NVIDIA Corporation", p: 138.55, m1: 18.7, m3: 35.4, sig: "Strong Buy", comp: 8.9 },
  { t: "AMZN", n: "Amazon.com Inc.", p: 198.04, m1: 4.2, m3: 9.1, sig: "Buy", comp: 6.8 },
  { t: "META", n: "Meta Platforms Inc.", p: 583.21, m1: 9.8, m3: 18.3, sig: "Buy", comp: 7.4 },
  { t: "INTC", n: "Intel Corporation", p: 21.45, m1: -12.5, m3: -25.8, sig: "Strong Sell", comp: 2.8 },
  { t: "XOM", n: "Exxon Mobil Corporation", p: 109.88, m1: -4.1, m3: -8.3, sig: "Sell", comp: 3.9 },
  { t: "KO", n: "The Coca-Cola Company", p: 68.45, m1: 1.2, m3: 3.4, sig: "Neutral", comp: 5.5 },
  { t: "DIS", n: "The Walt Disney Company", p: 102.78, m1: -1.8, m3: 2.1, sig: "Neutral", comp: 5.1 },
  { t: "GS", n: "Goldman Sachs Group Inc.", p: 585.23, m1: 6.5, m3: 14.7, sig: "Buy", comp: 7.1 },
];

function deterministicIndicators(seed) {
  // A tiny seeded generator that returns stable numbers in [0, 10]
  let x = seed;
  return INDICATOR_IDS.map((id, i) => {
    x = (x * 9301 + 49297) % 233280;
    const base = Math.min(10, Math.max(0, (x / 233280) * 10));
    // Nudge toward the composite so the instrument looks internally consistent.
    return { id, value: Math.round(base * 10) / 10 };
  });
}

function sparkline(seed, trend) {
  const pts = [];
  let v = 100;
  for (let i = 0; i < 60; i++) {
    v += trend * 0.2 + ((Math.sin(seed + i) + Math.cos(seed * 0.7 + i * 2)) * 0.6);
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
  indicators: deterministicIndicators(idx + 17),
  compositeScore: spec.comp,
  signal: spec.sig,
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
