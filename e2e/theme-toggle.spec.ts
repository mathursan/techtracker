import { test, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

async function htmlClass(page: Page): Promise<string> {
  return page.evaluate(() => document.documentElement.className ?? "");
}

async function waitForBootstrap(page: Page): Promise<void> {
  await expect(page.getByRole("button", { name: /theme/i })).toBeVisible();
  await page.waitForFunction(() =>
    document.documentElement.classList.contains("dark") ||
    document.documentElement.classList.contains("light"),
  );
}

test.describe("theme toggle (UC-12)", () => {
  // Playwright isolates browser contexts per test → localStorage is already
  // empty at the start. No beforeEach clear needed; the old init-script
  // approach also wiped on reload, breaking the persistence test.

  test("button is present and labeled", async ({ page }) => {
    await page.goto("/stocks");
    await expect(page.getByRole("button", { name: /theme/i })).toBeVisible();
  });

  test("toggling flips the html class between light and dark", async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/stocks");
    await waitForBootstrap(page);

    const before = await htmlClass(page);
    expect(before).toMatch(/\b(light|dark)\b/);

    await page.getByRole("button", { name: /theme/i }).click();

    await expect.poll(async () => htmlClass(page)).not.toBe(before);

    const after = await htmlClass(page);
    expect(after).toMatch(/\b(light|dark)\b/);
    expect(after).not.toBe(before);
  });

  test("choice persists across reload", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.goto("/stocks");
    await waitForBootstrap(page);

    const before = await htmlClass(page);
    await page.getByRole("button", { name: /theme/i }).click();
    await expect.poll(async () => htmlClass(page)).not.toBe(before);

    const afterClick = await htmlClass(page);
    const storedTheme = await page.evaluate(() =>
      localStorage.getItem("theme"),
    );
    expect(storedTheme).toMatch(/^(light|dark)$/);

    await page.reload();
    await waitForBootstrap(page);

    const afterReload = await htmlClass(page);
    expect(afterReload).toBe(afterClick);
  });
});
