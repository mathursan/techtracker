import { test, expect } from "@playwright/test";

test.describe("portfolio builder — presets (UC-08)", () => {
  test("/portfolio renders header + 4 preset cards and an empty-state prompt", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page.getByRole("heading", { name: "Portfolio Builder" })).toBeVisible();
    for (const name of [
      "Late Cycle Expansion",
      "Stagflation Hedge",
      "Risk-Off / Recession",
      "Reflation / Commodity Bull",
    ]) {
      await expect(page.getByRole("link", { name: new RegExp(name, "i") })).toBeVisible();
    }
    await expect(page.getByText(/Pick a preset to load a model portfolio/i)).toBeVisible();
  });

  test("clicking a preset populates the portfolio panel and sets URL", async ({ page }) => {
    await page.goto("/portfolio");
    await page.getByRole("link", { name: /Stagflation Hedge/i }).click();
    await expect(page).toHaveURL(/\?preset=stagflation/);
    // Panel summary strip — anchor on the uppercase tracking-wide labels.
    const panel = page.getByRole("region", { name: "Active portfolio" });
    await expect(panel).toBeVisible();
    await expect(panel.getByText(/^Holdings \(6\)$/)).toBeVisible();
    // Holdings table shows the 6 stagflation tickers.
    for (const t of ["GC=F", "SI=F", "CL=F", "HG=F", "XLE", "ZC=F"]) {
      await expect(page.getByRole("cell", { name: t, exact: true })).toBeVisible();
    }
  });

  test("deep link /portfolio?preset=late-cycle loads Late Cycle Expansion on first paint", async ({ page }) => {
    await page.goto("/portfolio?preset=late-cycle");
    // Active card marker + one expected ticker.
    const activeCard = page.locator('[aria-pressed="true"]');
    await expect(activeCard).toContainText(/Late Cycle Expansion/i);
    await expect(page.getByRole("cell", { name: "AAPL", exact: true })).toBeVisible();
  });

  test("clicking a resolved holding row opens the detail modal", async ({ page }) => {
    await page.goto("/portfolio?preset=late-cycle");
    // AAPL is a stocks row that should be resolved by the seeder.
    await page.locator("tbody tr", { hasText: "AAPL" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("garbage preset slug falls back to the empty-state view", async ({ page }) => {
    await page.goto("/portfolio?preset=nonsense");
    await expect(page.getByText(/Pick a preset to load a model portfolio/i)).toBeVisible();
  });

  test("clicking the active preset again clears the selection", async ({ page }) => {
    await page.goto("/portfolio?preset=stagflation");
    await expect(page.getByRole("cell", { name: "GC=F", exact: true })).toBeVisible();
    // Click the active card — should deselect and return to empty state.
    await page.locator('[aria-pressed="true"]').click();
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.getByText(/Pick a preset to load a model portfolio/i)).toBeVisible();
  });
});
