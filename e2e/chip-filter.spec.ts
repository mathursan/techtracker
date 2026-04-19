import { test, expect } from "@playwright/test";

test.describe("chip filter (UC-02)", () => {
  test("/stocks renders chips and clicking Financials narrows to GS", async ({
    page,
  }) => {
    await page.goto("/stocks");

    const chipFinancials = page.getByRole("tab", { name: /^Financials$/ });
    await expect(chipFinancials).toBeVisible();
    await chipFinancials.click();
    await expect(page).toHaveURL(/\?chip=financials/);

    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("GS");

    // KPI should recompute to showing 1 / 10.
    await expect(page.getByText(/Showing/)).toBeVisible();
    await expect(page.getByText(/1\s*\/\s*10/)).toBeVisible();
  });

  test("All chip returns to full list and clears the query param", async ({
    page,
  }) => {
    await page.goto("/stocks?chip=financials");
    await expect(page.locator("tbody tr")).toHaveCount(1);

    await page.getByRole("tab", { name: /^All$/ }).click();
    await expect(page).toHaveURL(/\/stocks$/);
    await expect(page.locator("tbody tr")).toHaveCount(10);
  });

  test("Unknown chip key in URL falls back to All", async ({ page }) => {
    await page.goto("/stocks?chip=not-a-real-key");
    await expect(page.locator("tbody tr")).toHaveCount(10);
    await expect(page.getByRole("tab", { name: /^All$/ })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });

  test("Information Technology narrows to 6 tech names", async ({ page }) => {
    await page.goto("/stocks?chip=tech");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(6);
  });
});
