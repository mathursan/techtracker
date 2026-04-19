import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";

import type { Instrument } from "@/domain/types";
import { ScreenerTable, sortInstruments } from "./screener-table";

afterEach(() => cleanup());

function mk(overrides: Partial<Instrument>): Instrument {
  return {
    ticker: "AAPL",
    name: "Apple Inc.",
    universe: "stocks",
    price: 200,
    perfOneMonth: 5,
    perfThreeMonth: 10,
    sparkline: [100, 101, 102, 103, 104, 105],
    indicators: [
      { id: "ma_trend", value: 8 },
      { id: "macd", value: 7 },
      { id: "adx_dmi", value: 6 },
      { id: "rsi", value: 5 },
      { id: "sar", value: 6 },
      { id: "bollinger", value: 4 },
      { id: "stochastic", value: 3 },
      { id: "obv", value: 7 },
      { id: "ichimoku", value: 5 },
    ],
    compositeScore: 6.5,
    signal: "Buy",
    asOf: "2026-04-19T00:00:00Z",
    ...overrides,
  };
}

describe("<ScreenerTable />", () => {
  const rows = [
    mk({ ticker: "AAPL", compositeScore: 6.5, perfOneMonth: 5 }),
    mk({ ticker: "MSFT", compositeScore: 8.2, perfOneMonth: 12, signal: "Strong Buy" }),
    mk({ ticker: "INTC", compositeScore: 3.1, perfOneMonth: -8, signal: "Strong Sell" }),
  ];

  it("renders a row per instrument", () => {
    render(<ScreenerTable instruments={rows} />);
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("MSFT")).toBeInTheDocument();
    expect(screen.getByText("INTC")).toBeInTheDocument();
  });

  it("default sort is composite score descending", () => {
    render(<ScreenerTable instruments={rows} />);
    const tickers = screen.getAllByText(/^(AAPL|MSFT|INTC)$/);
    expect(tickers.map((e) => e.textContent)).toEqual(["MSFT", "AAPL", "INTC"]);
  });

  it("clicking 1M % header sorts descending by 1M, then ascending on second click", () => {
    render(<ScreenerTable instruments={rows} />);
    fireEvent.click(screen.getByRole("button", { name: /1M %/ }));
    let tickers = screen.getAllByText(/^(AAPL|MSFT|INTC)$/);
    expect(tickers.map((e) => e.textContent)).toEqual(["MSFT", "AAPL", "INTC"]);

    fireEvent.click(screen.getByRole("button", { name: /1M %/ }));
    tickers = screen.getAllByText(/^(AAPL|MSFT|INTC)$/);
    expect(tickers.map((e) => e.textContent)).toEqual(["INTC", "AAPL", "MSFT"]);
  });

  it("empty state when no instruments", () => {
    render(<ScreenerTable instruments={[]} />);
    expect(screen.getByText(/No matches/i)).toBeInTheDocument();
  });
});

describe("sortInstruments helper", () => {
  const a = mk({ ticker: "A", compositeScore: 5, signal: "Buy" });
  const b = mk({ ticker: "B", compositeScore: 8, signal: "Strong Buy" });
  const c = mk({ ticker: "C", compositeScore: 2, signal: "Strong Sell" });

  it("signal sort ranks by severity (Strong Buy first desc)", () => {
    const out = sortInstruments([a, b, c], { key: "signal", direction: "desc" });
    expect(out.map((i) => i.ticker)).toEqual(["B", "A", "C"]);
  });

  it("ticker sort is alphabetical", () => {
    const out = sortInstruments([b, a, c], { key: "ticker", direction: "asc" });
    expect(out.map((i) => i.ticker)).toEqual(["A", "B", "C"]);
  });

  it("indicator sort reads from the id-matched entry", () => {
    const x = mk({ ticker: "X", indicators: [{ id: "rsi", value: 9 }] });
    const y = mk({ ticker: "Y", indicators: [{ id: "rsi", value: 1 }] });
    const out = sortInstruments([y, x], { key: "indicator:rsi", direction: "desc" });
    expect(out.map((i) => i.ticker)).toEqual(["X", "Y"]);
  });
});
