import { test, expect } from "@playwright/test";

test.describe("methodology + weight presets (UC-11)", () => {
  test("/methodology renders header, presets, sliders, bands, CLI", async ({ page }) => {
    await page.goto("/methodology");
    await expect(page.getByRole("heading", { name: "Methodology" })).toBeVisible();
    // Preset chips present.
    for (const name of ["Default", "Momentum Focus", "Trend Following", "Mean Reversion"]) {
      await expect(page.getByRole("tab", { name, exact: true })).toBeVisible();
    }
    // 9 sliders.
    await expect(page.getByRole("slider", { name: /Weight for MA Trend/i })).toBeVisible();
    await expect(page.getByRole("slider", { name: /Weight for Ichimoku/i })).toBeVisible();
    // Bands table — 5 signal badges visible.
    for (const sig of ["Strong Buy", "Buy", "Neutral", "Sell", "Strong Sell"]) {
      await expect(page.getByText(sig, { exact: true })).toBeVisible();
    }
    // CLI block.
    await expect(page.getByText(/python -m scoring.runner/)).toBeVisible();
    // Default preset active by default.
    await expect(page.getByRole("tab", { name: "Default", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("clicking Momentum Focus updates sliders and activates that preset", async ({ page }) => {
    await page.goto("/methodology");
    await page.getByRole("tab", { name: "Momentum Focus", exact: true }).click();
    await expect(page.getByRole("tab", { name: "Momentum Focus", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    // MA Trend weight in Momentum Focus is 10 (from weight-presets.ts).
    const maTrend = page.getByRole("slider", { name: /Weight for MA Trend/i });
    await expect(maTrend).toHaveValue("10");
  });

  test("active preset persists across reload", async ({ page }) => {
    await page.goto("/methodology");
    await page.getByRole("tab", { name: "Trend Following", exact: true }).click();
    await page.reload();
    await expect(page.getByRole("tab", { name: "Trend Following", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("screener banner shows when a non-default preset is active", async ({ page }) => {
    await page.goto("/methodology");
    await page.getByRole("tab", { name: "Momentum Focus", exact: true }).click();
    await page.goto("/stocks");
    await expect(
      page.getByText(/Active preset:.*Momentum Focus/i),
    ).toBeVisible();
  });

  test("screener banner hides when Default preset is active", async ({ page }) => {
    await page.goto("/stocks");
    // Default is the starting state; banner must not appear.
    await expect(page.getByText(/Active preset:/i)).toHaveCount(0);
  });

  test("Save Current flow creates a new user preset", async ({ page }) => {
    await page.goto("/methodology");
    // Drag the MA Trend slider to 25 to create a draft.
    const maTrend = page.getByRole("slider", { name: /Weight for MA Trend/i });
    await maTrend.fill("25");
    // Open the save input.
    await page.getByRole("button", { name: /Save Current/i }).click();
    await page.getByLabel("New preset name").fill("My Preset");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    // New chip appears + is active.
    await expect(page.getByRole("tab", { name: "My Preset", exact: true })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
