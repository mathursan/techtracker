import { test, expect } from "@playwright/test";

test.describe("screener search (UC-03)", () => {
  test("search input is present on /stocks", async ({ page }) => {
    await page.goto("/stocks");
    await expect(page.getByPlaceholder(/Search ticker or name/i)).toBeVisible();
  });

  test("typing narrows the table and updates the URL", async ({ page }) => {
    await page.goto("/stocks");
    const input = page.getByPlaceholder(/Search ticker or name/i);
    await input.fill("nvda");
    await expect(page).toHaveURL(/\?q=nvda$/);
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("NVDA");
  });

  test("name substring match is case-insensitive", async ({ page }) => {
    await page.goto("/stocks");
    await page.getByPlaceholder(/Search ticker or name/i).fill("APPLE");
    await expect.poll(async () => page.locator("tbody tr").count()).toBe(1);
    await expect(page.locator("tbody tr").first()).toContainText("AAPL");
  });

  test("chip + search intersect", async ({ page }) => {
    await page.goto("/stocks?chip=tech");
    await expect(page.locator("tbody tr")).toHaveCount(6);
    await page.getByPlaceholder(/Search ticker or name/i).fill("nv");
    await expect(page).toHaveURL(/chip=tech.*q=nv|q=nv.*chip=tech/);
    await expect.poll(async () => page.locator("tbody tr").count()).toBe(1);
  });

  test("no matches shows empty state", async ({ page }) => {
    await page.goto("/stocks?q=zzz");
    await expect(page.getByText(/No matches/i)).toBeVisible();
  });

  test("clearing via the X button removes q from URL", async ({ page }) => {
    await page.goto("/stocks?q=nvda");
    const clear = page.getByRole("button", { name: /Clear search/i });
    await clear.click();
    await expect(page).not.toHaveURL(/q=/);
    await expect.poll(async () => page.locator("tbody tr").count()).toBe(10);
  });

  test("deep link /stocks?q=gs renders filtered on first paint", async ({
    page,
  }) => {
    await page.goto("/stocks?q=gs");
    const rows = page.locator("tbody tr");
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText("GS");
  });
});
