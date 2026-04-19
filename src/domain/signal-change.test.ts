import { describe, expect, it } from "vitest";

import type { Instrument, ScoreSnapshot, Signal, Universe } from "./types";
import {
  DEFAULT_DIRECTION,
  DEFAULT_LOOKBACK,
  aggregateSignalChanges,
  parseDirection,
  parseLookback,
  parseUniverseScope,
} from "./signal-change";

function inst(ticker: string, signal: Signal, overrides: Partial<Instrument> = {}): Instrument {
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
    signal,
    asOf: "2026-04-19T20:00:00Z",
    ...overrides,
  };
}

function snap(universe: Universe, instruments: Instrument[]): ScoreSnapshot {
  return {
    asOf: "2026-04-19T20:00:00Z",
    universe,
    instruments,
    summary: {
      universe,
      displayName: universe,
      totalCount: instruments.length,
      avgScore: 0,
      strongBuyCount: 0,
      strongSellCount: 0,
      filters: [{ key: "all", label: "All" }],
    },
  };
}

const NO_SCOPE = {
  lookback: "1m" as const,
  direction: "all" as const,
  universeScope: null,
};

describe("aggregateSignalChanges", () => {
  it("marks noHistory when every input is missing its historical snapshot", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [inst("A", "Strong Buy")]),
          historical: null,
        },
      ],
      NO_SCOPE,
    );
    expect(vm.noHistory).toBe(true);
    expect(vm.rows).toHaveLength(0);
    expect(vm.allMarkets.upgrades).toBe(0);
    expect(vm.perUniverse[0].hasData).toBe(false);
  });

  it("drops flat rows and counts upgrades/downgrades", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [
            inst("U", "Strong Buy"),
            inst("D", "Strong Sell"),
            inst("F", "Neutral"),
          ]),
          historical: snap("stocks", [
            inst("U", "Neutral"),
            inst("D", "Buy"),
            inst("F", "Neutral"),
          ]),
        },
      ],
      NO_SCOPE,
    );
    expect(vm.rows.map((r) => r.instrument.ticker)).toEqual(["D", "U"]);
    expect(vm.allMarkets.upgrades).toBe(1);
    expect(vm.allMarkets.downgrades).toBe(1);
    expect(vm.perUniverse[0].upgrades).toBe(1);
    expect(vm.perUniverse[0].downgrades).toBe(1);
  });

  it("sorts by absolute severity jump desc, upgrades before equally-large downgrades", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [
            inst("BigUp", "Strong Buy"),    // 5 - 2 = +3
            inst("BigDown", "Strong Sell"), // 1 - 4 = -3
            inst("SmallUp", "Buy"),         // 4 - 3 = +1
          ]),
          historical: snap("stocks", [
            inst("BigUp", "Sell"),
            inst("BigDown", "Buy"),
            inst("SmallUp", "Neutral"),
          ]),
        },
      ],
      NO_SCOPE,
    );
    expect(vm.rows.map((r) => r.instrument.ticker)).toEqual([
      "BigUp",
      "BigDown",
      "SmallUp",
    ]);
  });

  it("direction filter scopes to upgrades or downgrades", () => {
    const input = [
      {
        universe: "stocks" as const,
        displayName: "Stocks",
        current: snap("stocks", [
          inst("U", "Strong Buy"),
          inst("D", "Strong Sell"),
        ]),
        historical: snap("stocks", [
          inst("U", "Neutral"),
          inst("D", "Buy"),
        ]),
      },
    ];
    const up = aggregateSignalChanges(input, {
      lookback: "1m",
      direction: "up",
      universeScope: null,
    });
    expect(up.rows.map((r) => r.instrument.ticker)).toEqual(["U"]);
    const down = aggregateSignalChanges(input, {
      lookback: "1m",
      direction: "down",
      universeScope: null,
    });
    expect(down.rows.map((r) => r.instrument.ticker)).toEqual(["D"]);
  });

  it("universeScope filters rows to one universe but keeps cross-universe counts intact", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [inst("A", "Strong Buy")]),
          historical: snap("stocks", [inst("A", "Neutral")]),
        },
        {
          universe: "commodities",
          displayName: "Commodities",
          current: snap("commodities", [inst("GC", "Strong Buy", { universe: "commodities" })]),
          historical: snap("commodities", [inst("GC", "Buy", { universe: "commodities" })]),
        },
      ],
      { lookback: "1m", direction: "all", universeScope: "stocks" },
    );
    expect(vm.rows.map((r) => r.universe)).toEqual(["stocks"]);
    expect(vm.allMarkets.upgrades).toBe(2);
    expect(vm.perUniverse).toHaveLength(2);
  });

  it("handles new tickers (no historical entry) by ignoring them — no row", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [
            inst("NEW", "Strong Buy"),
            inst("OLD", "Buy"),
          ]),
          historical: snap("stocks", [inst("OLD", "Neutral")]),
        },
      ],
      NO_SCOPE,
    );
    expect(vm.rows.map((r) => r.instrument.ticker)).toEqual(["OLD"]);
  });

  it("tie-breaks equal-magnitude upgrades by composite score desc", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [
            inst("L", "Buy", { compositeScore: 6.6 }),
            inst("H", "Buy", { compositeScore: 7.8 }),
          ]),
          historical: snap("stocks", [
            inst("L", "Neutral", { compositeScore: 5.2 }),
            inst("H", "Neutral", { compositeScore: 5.3 }),
          ]),
        },
      ],
      NO_SCOPE,
    );
    expect(vm.rows.map((r) => r.instrument.ticker)).toEqual(["H", "L"]);
  });

  it("tie-breaks equal-magnitude downgrades by composite score asc", () => {
    // Downgrades sort by composite asc — the deepest-damage name first.
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [
            inst("Shallow", "Sell", { compositeScore: 4.8 }),
            inst("Deep", "Sell", { compositeScore: 3.6 }),
          ]),
          historical: snap("stocks", [
            inst("Shallow", "Neutral", { compositeScore: 5.5 }),
            inst("Deep", "Neutral", { compositeScore: 5.5 }),
          ]),
        },
      ],
      { lookback: "1m", direction: "down", universeScope: null },
    );
    expect(vm.rows.map((r) => r.instrument.ticker)).toEqual(["Deep", "Shallow"]);
  });

  it("scoped counts isolate to the scoped universe; allMarkets stays global", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [inst("A", "Strong Buy")]),
          historical: snap("stocks", [inst("A", "Neutral")]),
        },
        {
          universe: "commodities",
          displayName: "Commodities",
          current: snap("commodities", [
            inst("GC", "Strong Buy", { universe: "commodities" }),
            inst("CL", "Strong Sell", { universe: "commodities" }),
          ]),
          historical: snap("commodities", [
            inst("GC", "Buy", { universe: "commodities" }),
            inst("CL", "Buy", { universe: "commodities" }),
          ]),
        },
      ],
      { lookback: "1m", direction: "all", universeScope: "stocks" },
    );
    expect(vm.scopedCounts).toEqual({ upgrades: 1, downgrades: 0 });
    expect(vm.allMarkets.upgrades).toBe(2);
    expect(vm.allMarkets.downgrades).toBe(1);
    expect(vm.scopedNoHistory).toBe(false);
  });

  it("scopedNoHistory flags a scoped universe with no historical snapshot", () => {
    const vm = aggregateSignalChanges(
      [
        {
          universe: "stocks",
          displayName: "Stocks",
          current: snap("stocks", [inst("A", "Strong Buy")]),
          historical: snap("stocks", [inst("A", "Neutral")]),
        },
        {
          universe: "commodities",
          displayName: "Commodities",
          current: snap("commodities", [inst("GC", "Buy", { universe: "commodities" })]),
          historical: null,
        },
      ],
      { lookback: "1m", direction: "all", universeScope: "commodities" },
    );
    expect(vm.scopedNoHistory).toBe(true);
    expect(vm.noHistory).toBe(false);
    expect(vm.scopedCounts).toEqual({ upgrades: 0, downgrades: 0 });
  });
});

describe("parsers", () => {
  it("parseLookback accepts 1w / 1m, falls back otherwise", () => {
    expect(parseLookback("1w")).toBe("1w");
    expect(parseLookback("1m")).toBe("1m");
    expect(parseLookback("1y")).toBe(DEFAULT_LOOKBACK);
    expect(parseLookback(undefined)).toBe(DEFAULT_LOOKBACK);
  });

  it("parseDirection accepts all / up / down", () => {
    expect(parseDirection("up")).toBe("up");
    expect(parseDirection("down")).toBe("down");
    expect(parseDirection("sideways")).toBe(DEFAULT_DIRECTION);
  });

  it("parseUniverseScope returns null for missing or invalid scope", () => {
    expect(parseUniverseScope("stocks", ["stocks", "commodities"])).toBe("stocks");
    expect(parseUniverseScope("crypto", ["stocks"])).toBeNull();
    expect(parseUniverseScope(undefined, ["stocks"])).toBeNull();
  });
});
