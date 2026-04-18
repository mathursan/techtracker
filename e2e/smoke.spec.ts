import { test, expect } from "@playwright/test";

test("home renders TechTracker brand", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /TechTracker/i })).toBeVisible();
});
