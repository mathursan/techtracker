import { test, expect } from "@playwright/test";

test.describe("signals hub (UC-06)", () => {
  test("/signals-hub renders header, universe strip, and default Top Buys grid", async ({ page }) => {
    await page.goto("/signals-hub");
    await expect(page.getByRole("heading", { name: "Signals Hub" })).toBeVisible();
    await expect(page.getByRole("tablist", { name: "Signals Hub view mode" })).toBeVisible();
    const topBuys = page.getByRole("tab", { name: /Top Buys/i });
    await expect(topBuys).toHaveAttribute("aria-selected", "true");
    // Universe strip shows at least stocks with real data.
    await expect(page.getByLabel(/Top 50 Stocks.*open screener/i)).toBeVisible();
    // Spotlight cards present.
    const cards = page.locator('[role="button"]', { hasText: /Strong Buy|Buy/ });
    await expect(cards.first()).toBeVisible();
  });

  test("switching view mode updates URL and content", async ({ page }) => {
    await page.goto("/signals-hub");
    await page.getByRole("tab", { name: /Top Sells/i }).click();
    await expect(page).toHaveURL(/\?view=top-sells/);
    await expect(page.getByRole("tab", { name: /Top Sells/i })).toHaveAttribute("aria-selected", "true");
  });

  test("deep link /signals-hub?view=heatmap renders the heatmap on first paint", async ({ page }) => {
    await page.goto("/signals-hub?view=heatmap");
    await expect(page.getByRole("table", { name: "Cross-universe signal distribution" })).toBeVisible();
    // 5 band column headers present.
    for (const band of ["Strong Sell", "Sell", "Neutral", "Buy", "Strong Buy"]) {
      await expect(
        page.getByRole("columnheader", { name: band, exact: true }),
      ).toBeVisible();
    }
  });

  test("clicking a spotlight card opens the detail modal", async ({ page }) => {
    await page.goto("/signals-hub");
    const firstCard = page.locator('[role="button"][aria-label$="— open detail"]').first();
    await firstCard.click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("clicking a populated universe card navigates to that universe's screener", async ({ page }) => {
    await page.goto("/signals-hub");
    await page.getByLabel(/Top 50 Stocks.*open screener/i).click();
    await expect(page).toHaveURL(/\/stocks$/);
    await expect(page.locator("tbody tr").first()).toBeVisible();
  });
});
