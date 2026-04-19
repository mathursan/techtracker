import { describe, expect, it } from "vitest";

import type { Instrument, ScoreSnapshot, Signal, Universe } from "./types";
import {
  DEFAULT_SIGNALS_HUB_VIEW,
  SIGNAL_BANDS,
  SPOTLIGHT_LIMIT,
  aggregateSignalsHub,
  parseSignalsHubView,
} from "./signals-hub";

function inst(
  ticker: string,
  universe: Universe,
  overrides: Partial<Instrument> = {},
): Instrument {
  return {
    ticker,
    name: `${ticker} Name`,
    universe,
    price: 100,
    perfOneMonth: 0,
    perfThreeMonth: 0,
    sparkline: [],
    indicators: [],
    compositeScore: 5,
    signal: "Neutral",
    asOf: "2026-04-19T20:00:00Z",
    ...overrides,
  };
}

function snap(universe: Universe, instruments: Instrument[]): ScoreSnapshot {
  const scores = instruments.map((i) => i.compositeScore);
  const avgScore =
    scores.length === 0 ? 0 : Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100) / 100;
  return {
    asOf: "2026-04-19T20:00:00Z",
    universe,
    instruments,
    summary: {
      universe,
      displayName: universe,
      totalCount: instruments.length,
      avgScore,
      strongBuyCount: instruments.filter((i) => i.signal === "Strong Buy").length,
      strongSellCount: instruments.filter((i) => i.signal === "Strong Sell").length,
      filters: [{ key: "all", label: "All" }],
    },
  };
}

describe("aggregateSignalsHub", () => {
  it("returns empty lists and a zero-count heatmap when all inputs are null", () => {
    const vm = aggregateSignalsHub([
      { universe: "stocks", displayName: "Stocks", snapshot: null },
      { universe: "commodities", displayName: "Commodities", snapshot: null },
    ]);
    expect(vm.topBuys).toHaveLength(0);
    expect(vm.topSells).toHaveLength(0);
    expect(vm.momentum).toHaveLength(0);
    expect(vm.snapshotCount).toBe(0);
    expect(vm.totalInstruments).toBe(0);
    expect(vm.universeCards.every((c) => !c.hasData)).toBe(true);
    expect(vm.heatmap.every((r) => !r.hasData && r.total === 0)).toBe(true);
  });

  it("filters Top Buys to Strong Buy / Buy and sorts by composite desc", () => {
    const vm = aggregateSignalsHub([
      {
        universe: "stocks",
        displayName: "Stocks",
        snapshot: snap("stocks", [
          inst("A", "stocks", { compositeScore: 7.5, signal: "Buy" }),
          inst("B", "stocks", { compositeScore: 9.1, signal: "Strong Buy" }),
          inst("C", "stocks", { compositeScore: 5.2, signal: "Neutral" }),
          inst("D", "stocks", { compositeScore: 2.1, signal: "Strong Sell" }),
        ]),
      },
    ]);
    expect(vm.topBuys.map((s) => s.instrument.ticker)).toEqual(["B", "A"]);
    expect(vm.topBuys.every((s) => ["Strong Buy", "Buy"].includes(s.instrument.signal))).toBe(true);
  });

  it("filters Top Sells to Strong Sell / Sell and sorts by composite asc", () => {
    const vm = aggregateSignalsHub([
      {
        universe: "stocks",
        displayName: "Stocks",
        snapshot: snap("stocks", [
          inst("X", "stocks", { compositeScore: 2.1, signal: "Strong Sell" }),
          inst("Y", "stocks", { compositeScore: 3.7, signal: "Sell" }),
          inst("Z", "stocks", { compositeScore: 5.0, signal: "Neutral" }),
        ]),
      },
    ]);
    expect(vm.topSells.map((s) => s.instrument.ticker)).toEqual(["X", "Y"]);
  });

  it("sorts Momentum by abs(perfOneMonth) desc and drops non-finite", () => {
    const vm = aggregateSignalsHub([
      {
        universe: "stocks",
        displayName: "Stocks",
        snapshot: snap("stocks", [
          inst("P", "stocks", { perfOneMonth: 3.1 }),
          inst("N", "stocks", { perfOneMonth: -12.5 }),
          inst("Z", "stocks", { perfOneMonth: 0 }),
          inst("NaN", "stocks", { perfOneMonth: Number.NaN }),
        ]),
      },
    ]);
    expect(vm.momentum.map((s) => s.instrument.ticker)).toEqual(["N", "P", "Z"]);
  });

  it("mixes across universes in a single ranking", () => {
    const vm = aggregateSignalsHub([
      {
        universe: "stocks",
        displayName: "Stocks",
        snapshot: snap("stocks", [
          inst("A", "stocks", { compositeScore: 8.2, signal: "Strong Buy" }),
        ]),
      },
      {
        universe: "commodities",
        displayName: "Commodities",
        snapshot: snap("commodities", [
          inst("GC", "commodities", { compositeScore: 8.8, signal: "Strong Buy" }),
        ]),
      },
    ]);
    expect(vm.topBuys[0].instrument.ticker).toBe("GC");
    expect(vm.topBuys[0].universe).toBe("commodities");
    expect(vm.topBuys[1].instrument.ticker).toBe("A");
    expect(vm.snapshotCount).toBe(2);
    expect(vm.totalInstruments).toBe(2);
  });

  it("caps each spotlight list at SPOTLIGHT_LIMIT", () => {
    const many = Array.from({ length: 20 }, (_, i) =>
      inst(`T${i}`, "stocks", { compositeScore: 9 - i * 0.1, signal: "Strong Buy" }),
    );
    const vm = aggregateSignalsHub([
      { universe: "stocks", displayName: "Stocks", snapshot: snap("stocks", many) },
    ]);
    expect(vm.topBuys).toHaveLength(SPOTLIGHT_LIMIT);
  });

  it("heatmap counts tile exactly to totals for each universe", () => {
    const vm = aggregateSignalsHub([
      {
        universe: "stocks",
        displayName: "Stocks",
        snapshot: snap("stocks", [
          inst("A", "stocks", { signal: "Strong Buy" }),
          inst("B", "stocks", { signal: "Strong Buy" }),
          inst("C", "stocks", { signal: "Buy" }),
          inst("D", "stocks", { signal: "Neutral" }),
          inst("E", "stocks", { signal: "Sell" }),
          inst("F", "stocks", { signal: "Strong Sell" }),
        ]),
      },
    ]);
    const row = vm.heatmap[0];
    expect(row.counts["Strong Buy"]).toBe(2);
    expect(row.counts.Buy).toBe(1);
    expect(row.counts.Neutral).toBe(1);
    expect(row.counts.Sell).toBe(1);
    expect(row.counts["Strong Sell"]).toBe(1);
    const sum = SIGNAL_BANDS.reduce((s, b) => s + row.counts[b as Signal], 0);
    expect(sum).toBe(row.total);
  });

  it("universeCards carry through summary numbers", () => {
    const vm = aggregateSignalsHub([
      {
        universe: "stocks",
        displayName: "Top 50 Stocks",
        snapshot: snap("stocks", [
          inst("A", "stocks", { compositeScore: 9, signal: "Strong Buy" }),
          inst("B", "stocks", { compositeScore: 2, signal: "Strong Sell" }),
        ]),
      },
    ]);
    const card = vm.universeCards[0];
    expect(card.hasData).toBe(true);
    expect(card.totalCount).toBe(2);
    expect(card.strongBuyCount).toBe(1);
    expect(card.strongSellCount).toBe(1);
    expect(card.displayName).toBe("Top 50 Stocks");
  });
});

describe("parseSignalsHubView", () => {
  it("accepts the four valid values", () => {
    expect(parseSignalsHubView("top-buys")).toBe("top-buys");
    expect(parseSignalsHubView("top-sells")).toBe("top-sells");
    expect(parseSignalsHubView("momentum")).toBe("momentum");
    expect(parseSignalsHubView("heatmap")).toBe("heatmap");
  });

  it("falls back to default for garbage / missing input", () => {
    expect(parseSignalsHubView(undefined)).toBe(DEFAULT_SIGNALS_HUB_VIEW);
    expect(parseSignalsHubView("nonsense")).toBe(DEFAULT_SIGNALS_HUB_VIEW);
    expect(parseSignalsHubView(123)).toBe(DEFAULT_SIGNALS_HUB_VIEW);
  });
});
