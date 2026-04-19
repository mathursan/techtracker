import { test, expect } from "@playwright/test";

test.describe("app shell & tab navigation (UC-14)", () => {
  test("/ redirects to /stocks", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/stocks$/);
    await expect(
      page.getByRole("heading", { name: "TechTracker" }),
    ).toBeVisible();
  });

  test("all 19 nav tabs render", async ({ page }) => {
    await page.goto("/stocks");
    // Scope to the section nav — the chip row also uses role=tab.
    const navTabs = page
      .getByRole("tablist", { name: "TechTracker sections" })
      .getByRole("tab");
    await expect(navTabs).toHaveCount(19);
  });

  test("clicking a tab navigates via client router (no full reload)", async ({
    page,
  }) => {
    await page.goto("/stocks");
    // Plant a sentinel on window. If Next.js keeps SPA state across the
    // navigation, the sentinel survives. A full reload would wipe it.
    await page.evaluate(() => {
      (window as Window & { __spaSentinel?: number }).__spaSentinel =
        Date.now();
    });

    await page.getByRole("tab", { name: "Signals Hub" }).click();
    await expect(page).toHaveURL(/\/signals-hub$/);

    const sentinelSurvived = await page.evaluate(
      () =>
        typeof (window as Window & { __spaSentinel?: number }).__spaSentinel ===
        "number",
    );
    expect(sentinelSurvived).toBe(true);

    await expect(
      page.getByRole("heading", { name: "TechTracker" }),
    ).toBeVisible();
  });

  test("deep link to /japan renders Japan active from first paint", async ({
    page,
  }) => {
    await page.goto("/japan");
    const japanTab = page.getByRole("tab", { name: /Japan/ });
    await expect(japanTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("heading", { name: "Japan" })).toBeVisible();
  });

  test("disclaimer is present on multiple routes", async ({ page }) => {
    for (const slug of ["stocks", "portfolio", "methodology"]) {
      await page.goto(`/${slug}`);
      await expect(
        page.getByText(/Past performance does not guarantee future results/),
      ).toBeVisible();
    }
  });

  test("mobile viewport: tab bar scrolls horizontally", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/europe");
    const europeTab = page.getByRole("tab", { name: /Europe/ });
    await expect(europeTab).toHaveAttribute("aria-selected", "true");
    await expect(europeTab).toBeInViewport();
  });

  test("unknown slug returns 404", async ({ page }) => {
    const response = await page.goto("/definitely-not-a-tab");
    expect(response?.status()).toBe(404);
  });
});
