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
    await expect(page.getByText(/Your portfolio is empty/i)).toBeVisible();
  });

  test("clicking a preset populates the portfolio panel and sets URL", async ({ page }) => {
    await page.goto("/portfolio");
    await page.getByRole("link", { name: /Stagflation Hedge/i }).click();
    await expect(page).toHaveURL(/\?preset=stagflation/);
    // Panel summary strip — anchor on the uppercase tracking-wide labels.
    const panel = page.getByRole("region", { name: "Active portfolio" });
    await expect(panel).toBeVisible();
    await expect(panel.getByText(/^Holdings \(6\)$/)).toBeVisible();
    // Holdings table shows the 6 stagflation tickers (scoped to the panel —
    // the candidate table below also lists them).
    for (const t of ["GC=F", "SI=F", "CL=F", "HG=F", "XLE", "ZC=F"]) {
      await expect(panel.getByRole("cell", { name: t, exact: true })).toBeVisible();
    }
  });

  test("deep link /portfolio?preset=late-cycle loads Late Cycle Expansion on first paint", async ({ page }) => {
    await page.goto("/portfolio?preset=late-cycle");
    // Active card marker + one expected ticker in the active-portfolio panel
    // (candidate table below also lists AAPL, so scope to the panel).
    const activeCard = page.locator('[aria-current="true"]');
    await expect(activeCard).toContainText(/Late Cycle Expansion/i);
    const panel = page.getByRole("region", { name: "Active portfolio" });
    await expect(panel.getByRole("cell", { name: "AAPL", exact: true })).toBeVisible();
  });

  test("clicking a resolved holding row opens the detail modal", async ({ page }) => {
    await page.goto("/portfolio?preset=late-cycle");
    // AAPL is a stocks row that should be resolved by the seeder. Scope to
    // the active-portfolio panel so we don't race with the candidate table.
    const panel = page.getByRole("region", { name: "Active portfolio" });
    await panel.locator("tbody tr", { hasText: "AAPL" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("garbage preset slug falls back to the custom empty-state view", async ({ page }) => {
    await page.goto("/portfolio?preset=nonsense");
    await expect(page.getByText(/Your portfolio is empty/i)).toBeVisible();
  });

  test("clicking the active preset again clears the selection", async ({ page }) => {
    await page.goto("/portfolio?preset=stagflation");
    const panel = page.getByRole("region", { name: "Active portfolio" });
    await expect(panel.getByRole("cell", { name: "GC=F", exact: true })).toBeVisible();
    // Click the active card — should deselect and return to empty state.
    await page.locator('[aria-current="true"]').click();
    await expect(page).toHaveURL(/\/portfolio$/);
    await expect(page.getByText(/Your portfolio is empty/i)).toBeVisible();
  });
});
