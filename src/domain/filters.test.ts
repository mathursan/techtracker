import { describe, it, expect } from "vitest";

import type { Instrument, UniverseSummary } from "./types";
import {
  ALL_CHIP_KEY,
  filterByChip,
  filterBySearch,
  normalizeSearch,
  resolveChipKey,
  summarizeFiltered,
} from "./filters";

function mk(
  ticker: string,
  tags: string[] | undefined,
  score = 7,
  name?: string,
): Instrument {
  return {
    ticker,
    name: name ?? ticker,
    universe: "stocks",
    price: 100,
    perfOneMonth: 0,
    perfThreeMonth: 0,
    sparkline: [],
    indicators: [],
    compositeScore: score,
    signal: score >= 8 ? "Strong Buy" : score >= 6.5 ? "Buy" : "Neutral",
    tags,
    asOf: "2026-04-19",
  };
}

const a = mk("A", ["tech"], 8.5, "Apple Inc.");
const b = mk("B", ["financials"], 7.0, "Bank of America");
const c = mk("C", ["tech", "hardware"], 6.0, "Cisco Systems");
const d = mk("D", undefined, 5.5, "Duke Energy");

const FILTERS = [
  { key: "all", label: "All" },
  { key: "tech", label: "Tech" },
  { key: "financials", label: "Financials" },
];

describe("filterByChip", () => {
  it("all returns everything", () => {
    expect(filterByChip([a, b, c, d], ALL_CHIP_KEY)).toHaveLength(4);
  });

  it("unknown / undefined returns everything", () => {
    expect(filterByChip([a, b, c, d], undefined)).toHaveLength(4);
    expect(filterByChip([a, b, c, d], "")).toHaveLength(4);
  });

  it("narrows to instruments whose tags include the key", () => {
    expect(filterByChip([a, b, c, d], "tech").map((i) => i.ticker)).toEqual(["A", "C"]);
    expect(filterByChip([a, b, c, d], "financials").map((i) => i.ticker)).toEqual(["B"]);
  });

  it("instrument with no tags matches nothing specific", () => {
    expect(filterByChip([d], "tech")).toEqual([]);
  });
});

describe("summarizeFiltered", () => {
  const base: UniverseSummary = {
    universe: "stocks",
    displayName: "Top 50",
    totalCount: 4,
    avgScore: 6.75,
    strongBuyCount: 1,
    strongSellCount: 0,
    filters: FILTERS,
  };

  it("preserves totalCount from base", () => {
    const out = summarizeFiltered(base, [a, c]);
    expect(out.totalCount).toBe(4);
  });

  it("recomputes avgScore over filtered rows", () => {
    const out = summarizeFiltered(base, [a, c]);
    expect(out.avgScore).toBeCloseTo(7.25);
  });

  it("recomputes strong-buy/strong-sell counts", () => {
    const out = summarizeFiltered(base, [a, b, c]);
    expect(out.strongBuyCount).toBe(1);
    expect(out.strongSellCount).toBe(0);
  });

  it("empty filtered set zeroes avg / counts without throwing", () => {
    const out = summarizeFiltered(base, []);
    expect(out.avgScore).toBe(0);
    expect(out.strongBuyCount).toBe(0);
    expect(out.strongSellCount).toBe(0);
    expect(out.totalCount).toBe(4);
  });
});

describe("resolveChipKey", () => {
  it("null → all", () => {
    expect(resolveChipKey(null, FILTERS)).toBe("all");
  });

  it("unknown key → all", () => {
    expect(resolveChipKey("not-a-real-key", FILTERS)).toBe("all");
  });

  it("valid key → that key", () => {
    expect(resolveChipKey("tech", FILTERS)).toBe("tech");
  });
});

describe("normalizeSearch", () => {
  it.each([
    [null, null],
    [undefined, null],
    ["", null],
    ["   ", null],
    ["AAPL", "aapl"],
    ["  Bank  ", "bank"],
  ] as const)("(%s) → %s", (input, expected) => {
    expect(normalizeSearch(input)).toBe(expected);
  });
});

describe("filterBySearch", () => {
  const rows = [a, b, c, d];

  it("null returns everything", () => {
    expect(filterBySearch(rows, null)).toHaveLength(4);
  });

  it("matches on ticker prefix", () => {
    expect(filterBySearch(rows, "b").map((i) => i.ticker)).toEqual(["B"]);
  });

  it("matches on name substring (case-insensitive)", () => {
    expect(filterBySearch(rows, "bank").map((i) => i.ticker)).toEqual(["B"]);
    expect(filterBySearch(rows, "APPLE").map((i) => i.ticker)).toEqual(["A"]);
    expect(filterBySearch(rows, "energy").map((i) => i.ticker)).toEqual(["D"]);
  });

  it("no matches returns empty", () => {
    expect(filterBySearch(rows, "zzz")).toEqual([]);
  });
});
