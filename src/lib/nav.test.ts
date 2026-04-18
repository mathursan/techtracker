import { describe, it, expect } from "vitest";

import { DEFAULT_TAB, TABS, TAB_SLUGS, hrefForTab, tabForSlug } from "./nav";

describe("nav", () => {
  it("has exactly 19 tabs", () => {
    expect(TABS.length).toBe(19);
  });

  it("splits 11 universes + 8 tools between rows", () => {
    const row1 = TABS.filter((t) => t.row === 1);
    const row2 = TABS.filter((t) => t.row === 2);
    expect(row1.length).toBe(11);
    expect(row2.length).toBe(8);
  });

  it("has unique slugs", () => {
    const slugs = new Set(TAB_SLUGS);
    expect(slugs.size).toBe(TABS.length);
  });

  it("verbatim labels match the source", () => {
    const labels = TABS.map((t) => t.label);
    expect(labels).toEqual([
      "Top 50 Stocks",
      "Sector ETFs",
      "Industry ETFs",
      "Country ETFs",
      "Currencies",
      "Commodities",
      "India",
      "Hong Kong",
      "Singapore",
      "Japan",
      "Europe",
      "Fixed Income",
      "Broad Market",
      "Growth/Value",
      "Portfolio Builder",
      "Signals Hub",
      "Signal Change",
      "Analytics",
      "Methodology",
    ]);
  });

  it("every tab has an icon", () => {
    for (const tab of TABS) {
      expect(tab.icon).toBeDefined();
    }
  });

  it("country tabs carry a 2-letter flagBadge, others do not", () => {
    for (const tab of TABS) {
      if (["india", "hong-kong", "singapore", "japan", "europe"].includes(tab.slug)) {
        expect(tab.flagBadge).toMatch(/^[A-Z]{2}$/);
      } else {
        expect(tab.flagBadge).toBeUndefined();
      }
    }
  });

  it("every tab points to a plannedIssue", () => {
    for (const tab of TABS) {
      expect(tab.plannedIssue).toBeGreaterThan(0);
    }
  });

  it("DEFAULT_TAB is Top 50 Stocks", () => {
    expect(DEFAULT_TAB.slug).toBe("stocks");
    expect(DEFAULT_TAB.label).toBe("Top 50 Stocks");
  });

  it("tabForSlug resolves + unknown returns undefined", () => {
    expect(tabForSlug("japan")?.label).toBe("Japan");
    expect(tabForSlug("not-a-tab")).toBeUndefined();
  });

  it("hrefForTab returns a root-relative path", () => {
    expect(hrefForTab(DEFAULT_TAB)).toBe("/stocks");
    expect(hrefForTab(TABS[14])).toBe("/portfolio");
  });
});
