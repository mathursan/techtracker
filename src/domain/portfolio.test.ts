import { describe, expect, it } from "vitest";

import type { Instrument, ScoreSnapshot, Universe } from "./types";
import type { PortfolioPreset } from "./portfolio-presets";
import {
  PORTFOLIO_PRESETS,
  parsePresetSlug,
  presetBySlug,
} from "./portfolio-presets";
import { buildPortfolioVM, findInstrumentByTicker } from "./portfolio";

function inst(ticker: string, overrides: Partial<Instrument> = {}): Instrument {
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
      filters: [],
    },
  };
}

const preset = (holdings: PortfolioPreset["holdings"]): PortfolioPreset => ({
  slug: "late-cycle",
  emoji: "🔄",
  name: "Test Preset",
  thesis: "t",
  holdings,
});

describe("portfolio-presets config", () => {
  it("exposes 4 canonical macro-regime presets with unique slugs", () => {
    expect(PORTFOLIO_PRESETS).toHaveLength(4);
    const slugs = PORTFOLIO_PRESETS.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(4);
    expect(slugs).toEqual(
      expect.arrayContaining(["late-cycle", "stagflation", "risk-off", "reflation"]),
    );
  });

  it("every holding has a non-empty ticker string", () => {
    for (const p of PORTFOLIO_PRESETS) {
      for (const h of p.holdings) {
        expect(typeof h.ticker).toBe("string");
        expect(h.ticker.length).toBeGreaterThan(0);
      }
    }
  });

  it("parsePresetSlug accepts the 4 valid slugs, rejects others", () => {
    expect(parsePresetSlug("late-cycle")).toBe("late-cycle");
    expect(parsePresetSlug("risk-off")).toBe("risk-off");
    expect(parsePresetSlug("nope")).toBeNull();
    expect(parsePresetSlug(undefined)).toBeNull();
    expect(parsePresetSlug(42)).toBeNull();
  });

  it("presetBySlug round-trips", () => {
    expect(presetBySlug("stagflation").slug).toBe("stagflation");
  });
});

describe("findInstrumentByTicker", () => {
  it("returns the first match across snapshots", () => {
    const s1 = snap("stocks", [inst("AAPL")]);
    const s2 = snap("sector-etfs", [inst("XLK", { universe: "sector-etfs" })]);
    expect(findInstrumentByTicker("XLK", [s1, s2])?.ticker).toBe("XLK");
  });

  it("returns null for an unresolved ticker", () => {
    const s1 = snap("stocks", [inst("AAPL")]);
    expect(findInstrumentByTicker("MISSING", [s1])).toBeNull();
  });

  it("ignores null snapshots in the input list", () => {
    const s1 = snap("stocks", [inst("AAPL")]);
    expect(findInstrumentByTicker("AAPL", [null, s1, null])?.ticker).toBe("AAPL");
  });
});

describe("buildPortfolioVM", () => {
  it("equal-weights when no holding declares weight", () => {
    const p = preset([{ ticker: "A" }, { ticker: "B" }, { ticker: "C" }, { ticker: "D" }]);
    const s = snap("stocks", [
      inst("A", { compositeScore: 8 }),
      inst("B", { compositeScore: 6 }),
      inst("C", { compositeScore: 4 }),
      inst("D", { compositeScore: 2 }),
    ]);
    const vm = buildPortfolioVM(p, [s]);
    expect(vm.holdings.map((h) => h.weight)).toEqual([25, 25, 25, 25]);
    expect(vm.score).toBe(5);
    expect(vm.resolvedCount).toBe(4);
    expect(vm.unresolvedCount).toBe(0);
  });

  it("distributes remaining weight equally across un-weighted when some weights are explicit", () => {
    const p = preset([
      { ticker: "A", weight: 40 },
      { ticker: "B" },
      { ticker: "C" },
      { ticker: "D" },
    ]);
    const s = snap("stocks", [
      inst("A", { compositeScore: 10 }),
      inst("B", { compositeScore: 6 }),
      inst("C", { compositeScore: 4 }),
      inst("D", { compositeScore: 2 }),
    ]);
    const vm = buildPortfolioVM(p, [s]);
    // A is 40; B/C/D split the remaining 60 → 20 each.
    expect(vm.holdings.map((h) => h.weight)).toEqual([40, 20, 20, 20]);
    // Score: (40*10 + 20*6 + 20*4 + 20*2) / 100 = (400+120+80+40)/100 = 6.4
    expect(vm.score).toBe(6.4);
  });

  it("excludes unresolved holdings from the score but keeps them in the table", () => {
    const p = preset([{ ticker: "A" }, { ticker: "GHOST" }]);
    const s = snap("stocks", [inst("A", { compositeScore: 8 })]);
    const vm = buildPortfolioVM(p, [s]);
    expect(vm.holdings).toHaveLength(2);
    expect(vm.resolvedCount).toBe(1);
    expect(vm.unresolvedCount).toBe(1);
    // A's weight is 50, GHOST's weight is 50 (equal-weight). Only A scores:
    // weighted = 50 * 8 = 400; normalised = 400 / 50 = 8.
    expect(vm.score).toBe(8);
    expect(vm.resolvedWeightTotal).toBe(50);
  });

  it("returns score=null when nothing resolves", () => {
    const p = preset([{ ticker: "GHOST1" }, { ticker: "GHOST2" }]);
    const s = snap("stocks", [inst("A")]);
    const vm = buildPortfolioVM(p, [s]);
    expect(vm.score).toBeNull();
    expect(vm.resolvedCount).toBe(0);
    expect(vm.resolvedWeightTotal).toBe(0);
  });

  it("holding order matches preset order, unresolved in-place", () => {
    const p = preset([{ ticker: "A" }, { ticker: "GHOST" }, { ticker: "C" }]);
    const s = snap("stocks", [inst("A"), inst("C")]);
    const vm = buildPortfolioVM(p, [s]);
    expect(vm.holdings.map((h) => h.ticker)).toEqual(["A", "GHOST", "C"]);
  });
});
