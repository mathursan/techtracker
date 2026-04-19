import { describe, expect, it } from "vitest";

import type { Instrument, Signal } from "./types";
import {
  SIGNAL_ORDER,
  aggregateAnalytics,
  histogramBucketIndex,
} from "./analytics";

function inst(
  ticker: string,
  overrides: Partial<Instrument> = {},
): Instrument {
  return {
    ticker,
    name: `${ticker} Name`,
    universe: "stocks",
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

const FILTERS = [
  { key: "all", label: "All" },
  { key: "tech", label: "Information Technology" },
  { key: "energy", label: "Energy" },
  { key: "cons-staples", label: "Consumer Staples" },
];

describe("histogramBucketIndex", () => {
  it("assigns scores to 0..9 buckets", () => {
    expect(histogramBucketIndex(0)).toBe(0);
    expect(histogramBucketIndex(0.5)).toBe(0);
    expect(histogramBucketIndex(5)).toBe(5);
    expect(histogramBucketIndex(9)).toBe(9);
  });

  it("right-closes the last bucket so 10 lands in bucket 9", () => {
    expect(histogramBucketIndex(10)).toBe(9);
    expect(histogramBucketIndex(9.99)).toBe(9);
  });

  it("clamps negatives to 0", () => {
    expect(histogramBucketIndex(-5)).toBe(0);
  });
});

describe("aggregateAnalytics", () => {
  it("returns an empty histogram + zero counts when input is empty", () => {
    const vm = aggregateAnalytics({
      universeLabel: "Stocks",
      asOf: "2026-04-19",
      instruments: [],
      filters: FILTERS,
    });
    expect(vm.totalCount).toBe(0);
    expect(vm.signalDistribution.every((b) => b.count === 0)).toBe(true);
    expect(vm.sectorAverages).toHaveLength(0);
    expect(vm.scoreHistogram.every((b) => b.count === 0)).toBe(true);
    expect(vm.scoreHistogram).toHaveLength(10);
  });

  it("signal distribution preserves canonical order and counts each band", () => {
    const signals: Signal[] = [
      "Strong Buy",
      "Buy",
      "Buy",
      "Neutral",
      "Sell",
      "Strong Sell",
      "Strong Sell",
    ];
    const vm = aggregateAnalytics({
      universeLabel: "Stocks",
      asOf: "2026-04-19",
      instruments: signals.map((s, i) => inst(`T${i}`, { signal: s })),
      filters: FILTERS,
    });
    expect(vm.signalDistribution.map((b) => b.signal)).toEqual([...SIGNAL_ORDER]);
    expect(vm.signalDistribution.map((b) => b.count)).toEqual([2, 1, 1, 2, 1]);
  });

  it("sector averages group by tag, sort desc, and use chip labels", () => {
    const vm = aggregateAnalytics({
      universeLabel: "Stocks",
      asOf: "2026-04-19",
      instruments: [
        inst("A", { compositeScore: 8, tags: ["tech"] }),
        inst("B", { compositeScore: 6, tags: ["tech"] }),
        inst("C", { compositeScore: 3, tags: ["energy"] }),
        inst("D", { compositeScore: 5, tags: ["cons-staples"] }),
      ],
      filters: FILTERS,
    });
    expect(vm.sectorAverages.map((s) => [s.label, s.avgScore])).toEqual([
      ["Information Technology", 7],
      ["Consumer Staples", 5],
      ["Energy", 3],
    ]);
  });

  it("ignores `all` tag and tags without a matching chip label", () => {
    const vm = aggregateAnalytics({
      universeLabel: "Stocks",
      asOf: "2026-04-19",
      instruments: [
        inst("X", { compositeScore: 9, tags: ["all"] }),
        inst("Y", { compositeScore: 9, tags: ["unknown-sector"] }),
        inst("Z", { compositeScore: 9, tags: ["tech"] }),
      ],
      filters: FILTERS,
    });
    expect(vm.sectorAverages.map((s) => s.key)).toEqual(["tech"]);
  });

  it("score histogram bucket counts sum to totalCount", () => {
    const instruments = [
      inst("A", { compositeScore: 0.1 }),
      inst("B", { compositeScore: 3.5 }),
      inst("C", { compositeScore: 5.5 }),
      inst("D", { compositeScore: 9.9 }),
      inst("E", { compositeScore: 10 }),
    ];
    const vm = aggregateAnalytics({
      universeLabel: "Stocks",
      asOf: "2026-04-19",
      instruments,
      filters: FILTERS,
    });
    const bucketSum = vm.scoreHistogram.reduce((s, b) => s + b.count, 0);
    expect(bucketSum).toBe(instruments.length);
    expect(vm.scoreHistogram[0].count).toBe(1);
    expect(vm.scoreHistogram[3].count).toBe(1);
    expect(vm.scoreHistogram[5].count).toBe(1);
    // 9.9 and 10 both land in bucket 9 (right-inclusive).
    expect(vm.scoreHistogram[9].count).toBe(2);
  });

  it("handles instruments without tags (no sector attribution)", () => {
    const vm = aggregateAnalytics({
      universeLabel: "Stocks",
      asOf: "2026-04-19",
      instruments: [
        inst("A", { compositeScore: 7 }),
        inst("B", { compositeScore: 5, tags: [] }),
      ],
      filters: FILTERS,
    });
    expect(vm.sectorAverages).toHaveLength(0);
    expect(vm.totalCount).toBe(2);
  });
});
