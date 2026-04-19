import { test, expect } from "@playwright/test";

test.describe("analytics (UC-10)", () => {
  test("/analytics renders header + 3 chart cards", async ({ page }) => {
    await page.goto("/analytics");
    await expect(page.getByRole("heading", { name: "Analytics", exact: true })).toBeVisible();
    await expect(page.getByRole("region", { name: "Signal Distribution" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Sector Average Score" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Score Histogram" })).toBeVisible();
  });

  test("signal distribution + histogram buckets render SVG bars", async ({ page }) => {
    await page.goto("/analytics");
    // Recharts draws <rect class="recharts-rectangle" ...> for bars. We don't
    // assert specific values (depends on seed), but the chart must paint
    // something.
    await expect(page.getByRole("region", { name: "Signal Distribution" }).locator("svg")).toBeVisible();
    await expect(page.getByRole("region", { name: "Score Histogram" }).locator("svg")).toBeVisible();
  });

  test("sector average chart lists expected sector labels from the seed", async ({ page }) => {
    await page.goto("/analytics");
    const sector = page.getByRole("region", { name: "Sector Average Score" });
    // Seed has tickers tagged tech / energy / cons-staples / comm-services /
    // financials. At least one must appear as a y-axis label.
    const yAxisText = sector.locator("svg .recharts-yAxis");
    await expect(yAxisText).toBeVisible();
    // Cheap cross-check: chip labels come from the summary filters.
    const hasKnown = await sector.locator("text").filter({
      hasText: /Information Technology|Financials|Energy/,
    }).count();
    expect(hasKnown).toBeGreaterThan(0);
  });

  test("switching weight preset updates the analytics view", async ({ page }) => {
    await page.goto("/methodology");
    await page.getByRole("tab", { name: "Momentum Focus", exact: true }).click();
    await page.goto("/analytics");
    // Banner should now show on /analytics too (cross-surface banner).
    await expect(page.getByText(/Active preset:.*Momentum Focus/i)).toBeVisible();
  });

  test("analytics lede shows universe + count", async ({ page }) => {
    await page.goto("/analytics");
    // Scope to the page <header> to avoid matching the TabBar link with
    // "Top 50 Stocks" as its label.
    const header = page.locator("header").filter({ has: page.getByRole("heading", { name: "Analytics", exact: true }) });
    await expect(header.getByText(/Top 50 Stocks/i)).toBeVisible();
    await expect(header.getByText(/instruments/i)).toBeVisible();
  });
});
