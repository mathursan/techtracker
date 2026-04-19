import { test, expect } from "@playwright/test";

test.describe("portfolio builder — custom (UC-09)", () => {
  // Playwright creates a fresh BrowserContext per test case, so localStorage
  // is naturally empty at the start of each test. No beforeEach cleanup
  // needed — addInitScript would reapply on page.reload() and break the
  // persistence test.

  test("/portfolio shows the empty-state message and the candidate table", async ({ page }) => {
    await page.goto("/portfolio");
    await expect(page.getByText(/Your portfolio is empty/i)).toBeVisible();
    await expect(page.getByRole("region", { name: "Add holdings" })).toBeVisible();
    await expect(page.getByRole("tab", { name: "All", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("clicking + on a candidate adds it to the portfolio; disables the button", async ({ page }) => {
    await page.goto("/portfolio");
    const addBtn = page.getByRole("button", { name: /Add AAPL to portfolio/i });
    await addBtn.click();
    // Custom panel now shows AAPL with 100% weight.
    const customPanel = page.getByRole("region", { name: "Custom portfolio" });
    await expect(customPanel).toBeVisible();
    await expect(customPanel.getByRole("cell", { name: "AAPL", exact: true })).toBeVisible();
    // Add button flipped to checkmark / disabled.
    await expect(page.getByRole("button", { name: /AAPL already in portfolio/i })).toBeDisabled();
  });

  test("remove button deletes a holding and updates the panel", async ({ page }) => {
    await page.goto("/portfolio");
    await page.getByRole("button", { name: /Add MSFT to portfolio/i }).click();
    await page.getByRole("button", { name: /Add NVDA to portfolio/i }).click();
    const panel = page.getByRole("region", { name: "Custom portfolio" });
    await expect(panel.getByRole("cell", { name: "NVDA", exact: true })).toBeVisible();
    await panel.getByRole("button", { name: /Remove MSFT from portfolio/i }).click();
    await expect(panel.getByRole("cell", { name: "MSFT", exact: true })).toHaveCount(0);
    await expect(panel.getByRole("cell", { name: "NVDA", exact: true })).toBeVisible();
  });

  test("asset-class chip filters the candidate table", async ({ page }) => {
    await page.goto("/portfolio");
    // Switch to Commodity; AAPL shouldn't appear; GC=F should.
    await page.getByRole("tab", { name: "Commodity", exact: true }).click();
    await expect(page.getByRole("cell", { name: "GC=F", exact: true })).toBeVisible();
    await expect(page.getByRole("cell", { name: "AAPL", exact: true })).toHaveCount(0);
  });

  test("search narrows the candidate table", async ({ page }) => {
    await page.goto("/portfolio");
    await page.getByLabel("Search candidate instruments").fill("NVDA");
    // Only NVDA remains.
    const rows = page.getByRole("region", { name: "Add holdings" }).locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("NVDA");
  });

  test("portfolio persists across reloads via localStorage", async ({ page }) => {
    await page.goto("/portfolio");
    await page.getByRole("button", { name: /Add GS to portfolio/i }).click();
    await page.reload();
    const panel = page.getByRole("region", { name: "Custom portfolio" });
    await expect(panel.getByRole("cell", { name: "GS", exact: true })).toBeVisible();
  });

  test("Customize button on a preset copies its holdings into the custom store and clears the URL", async ({ page }) => {
    await page.goto("/portfolio?preset=stagflation");
    // Preset panel visible.
    await expect(page.getByRole("region", { name: "Active portfolio" })).toBeVisible();
    await page.getByRole("button", { name: /Customize this preset/i }).click();
    // URL clears preset param.
    await expect(page).toHaveURL(/\/portfolio$/);
    // Custom panel now lists Stagflation Hedge's 6 tickers.
    const panel = page.getByRole("region", { name: "Custom portfolio" });
    await expect(panel).toBeVisible();
    for (const t of ["GC=F", "SI=F", "CL=F", "HG=F", "XLE", "ZC=F"]) {
      await expect(panel.getByRole("cell", { name: t, exact: true })).toBeVisible();
    }
  });
});
