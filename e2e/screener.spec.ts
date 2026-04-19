import { test, expect } from "@playwright/test";

test.describe("screener view (UC-01)", () => {
  test("/stocks renders KPI cards + a sortable table", async ({ page }) => {
    await page.goto("/stocks");

    // KPI cards.
    await expect(page.getByText(/Avg Score/i)).toBeVisible();
    await expect(page.getByText(/Strong Buy/i).first()).toBeVisible();
    await expect(page.getByText(/Strong Sell/i).first()).toBeVisible();
    await expect(page.getByText(/Showing/i)).toBeVisible();

    // Table renders rows from the seeded fixture (10 instruments).
    await expect(page.getByRole("button", { name: /Score/i }).first()).toBeVisible();
    await expect(page.getByText("AAPL").first()).toBeVisible();
    await expect(page.getByText("NVDA").first()).toBeVisible();

    // Default sort is compositeScore desc — NVDA (8.9) should outrank AAPL (7.2).
    const rows = await page.locator("tbody tr").all();
    expect(rows.length).toBeGreaterThanOrEqual(10);
    const firstCell = await rows[0].locator("td").first().textContent();
    expect(firstCell).toMatch(/NVDA/);
  });

  test("clicking 1M % twice sorts ascending then descending", async ({ page }) => {
    await page.goto("/stocks");

    await page.getByRole("button", { name: /1M %/ }).click();
    let first = await page.locator("tbody tr").first().locator("td").first().textContent();
    // First click → descending (NVDA +18.7% tops).
    expect(first).toMatch(/NVDA/);

    await page.getByRole("button", { name: /1M %/ }).click();
    first = await page.locator("tbody tr").first().locator("td").first().textContent();
    // Second click → ascending (INTC -12.5% tops).
    expect(first).toMatch(/INTC/);
  });

  test("all tool tabs render real content post-UC-10 ship", async ({ page }) => {
    // This used to verify /analytics placeholders before UC-10 shipped.
    // Now every tool tab has its real view — assert on the h1 per tab.
    const expectations: Array<[string, RegExp]> = [
      ["/signals-hub", /Signals Hub/i],
      ["/signal-change", /Signal Change/i],
      ["/portfolio", /Portfolio Builder/i],
      ["/analytics", /Analytics/i],
      ["/methodology", /Methodology/i],
    ];
    for (const [path, heading] of expectations) {
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, level: 1 })).toBeVisible();
    }
  });
});
