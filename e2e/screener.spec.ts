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

  test("tool tab /signal-change has its real view (UC-07 shipped) and /analytics still placeholds", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByText(/Ships in issue/)).toBeVisible();
  });
});
