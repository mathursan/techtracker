import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";

import { INDICATOR_IDS } from "@/domain/types";
import { IndicatorScoresPanel } from "./indicator-scores-panel";

afterEach(() => cleanup());

const scores = INDICATOR_IDS.map((id, i) => ({ id, value: 2 + i }));

describe("<IndicatorScoresPanel />", () => {
  it("renders all 9 indicator rows in canonical order", () => {
    render(<IndicatorScoresPanel scores={scores} />);
    const labels = [
      "MA Trend",
      "MACD",
      "ADX/DMI",
      "RSI",
      "SAR",
      "Bollinger",
      "Stochastic",
      "OBV",
      "Ichimoku",
    ];
    for (const label of labels) {
      expect(screen.getByText(label)).toBeInTheDocument();
    }
  });

  it("renders scale legend with 0 / 5 / 10 band labels", () => {
    render(<IndicatorScoresPanel scores={scores} />);
    expect(screen.getByText(/Strong Sell/)).toBeInTheDocument();
    expect(screen.getByText(/Strong Buy/)).toBeInTheDocument();
    expect(screen.getByText(/Neutral/)).toBeInTheDocument();
  });

  it("renders each score value to 1 decimal", () => {
    render(<IndicatorScoresPanel scores={scores} />);
    expect(screen.getByText("2.0")).toBeInTheDocument();
    expect(screen.getByText("10.0")).toBeInTheDocument();
  });

  it("displays weight percentages", () => {
    render(<IndicatorScoresPanel scores={scores} />);
    // Default weights: MA Trend 18%, MACD 15%, etc. No decimals in display.
    expect(screen.getByText("18%")).toBeInTheDocument();
    expect(screen.getByText("15%")).toBeInTheDocument();
  });
});
