import { test, expect } from "@playwright/test";

test.describe("signal change (UC-07)", () => {
  test("/signal-change renders header, lookback toggle, universe strip, and changes table", async ({ page }) => {
    await page.goto("/signal-change");
    await expect(page.getByRole("heading", { name: "Signal Change" })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Lookback window" })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Direction filter" })).toBeVisible();
    // "All markets" card present.
    await expect(page.getByRole("link", { name: /All markets/i })).toBeVisible();
    // Default is 1 Month, aria-selected on the 1 Month tab.
    await expect(page.getByRole("tab", { name: "1 Month" })).toHaveAttribute("aria-selected", "true");
    // Table has at least one row (seeder produces deltas).
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });

  test("lookback toggle updates URL and re-renders", async ({ page }) => {
    await page.goto("/signal-change");
    await page.getByRole("tab", { name: "1 Week" }).click();
    await expect(page).toHaveURL(/\?lookback=1w/);
    await expect(page.getByRole("tab", { name: "1 Week" })).toHaveAttribute("aria-selected", "true");
  });

  test("direction filter scopes the table", async ({ page }) => {
    await page.goto("/signal-change");
    await page.getByRole("tab", { name: /Upgrades/i }).click();
    await expect(page).toHaveURL(/\?direction=up/);
    // All table rows should show the up arrow (hidden text "→ ⬆").
    const tbody = page.locator("tbody");
    await expect(tbody).toBeVisible();
    // Downgrades shouldn't appear.
    const rows = tbody.locator("tr");
    const count = await rows.count();
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i)).toContainText("⬆");
    }
  });

  test("clicking a universe card scopes the table to that universe", async ({ page }) => {
    await page.goto("/signal-change");
    // Click the Top 50 Stocks universe card.
    await page.getByRole("link", { name: /Top 50 Stocks/i }).first().click();
    await expect(page).toHaveURL(/\?u=stocks/);
    // Universe column should only show the scoped universe's label.
    const cells = page.locator("tbody tr td:nth-child(3)");
    const count = await cells.count();
    for (let i = 0; i < count; i++) {
      await expect(cells.nth(i)).toHaveText(/Top 50 Stocks/i);
    }
  });

  test("row click opens the detail modal", async ({ page }) => {
    await page.goto("/signal-change");
    await page.locator("tbody tr").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });
});
