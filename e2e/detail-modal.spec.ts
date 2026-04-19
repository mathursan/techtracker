import { test, expect } from "@playwright/test";

test.describe("ticker detail modal (UC-05)", () => {
  test("clicking a screener row opens the modal", async ({ page }) => {
    await page.goto("/stocks");
    await page.locator("tbody tr", { hasText: "NVDA" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    // Dialog.Title renders as the heading inside the dialog.
    await expect(dialog.getByRole("heading", { name: "NVDA" })).toBeVisible();
    await expect(dialog.getByText("NVIDIA Corporation")).toBeVisible();
    await expect(dialog.getByText(/Indicator Scores/i)).toBeVisible();
  });

  test("Escape closes the modal", async ({ page }) => {
    await page.goto("/stocks");
    await page.locator("tbody tr", { hasText: "AAPL" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("the X button closes the modal", async ({ page }) => {
    await page.goto("/stocks");
    await page.locator("tbody tr", { hasText: "MSFT" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(page.getByRole("dialog")).not.toBeVisible();
  });

  test("chart kind tabs show placeholders for history-dependent ones", async ({
    page,
  }) => {
    await page.goto("/stocks");
    await page.locator("tbody tr", { hasText: "NVDA" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();

    // Price (default) — no placeholder.
    await expect(dialog.getByText(/Per-timeframe history/i)).not.toBeVisible();

    // Click RSI — placeholder shows.
    await dialog.getByRole("tab", { name: "RSI" }).click();
    await expect(dialog.getByText(/Per-timeframe history/i)).toBeVisible();

    // Click Radar — no placeholder, chart renders.
    await dialog.getByRole("tab", { name: "Radar" }).click();
    await expect(dialog.getByText(/Per-timeframe history/i)).not.toBeVisible();
  });

  test("keyboard: Enter on a row opens the modal", async ({ page }) => {
    await page.goto("/stocks");
    const row = page.locator("tbody tr", { hasText: "GS" });
    await row.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page.getByRole("dialog").getByText("GS").first()).toBeVisible();
  });
});
