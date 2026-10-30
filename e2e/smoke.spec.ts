import { expect, test } from "@playwright/test";

test("a vitrine carrega a partir do build em preview", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("link", { name: "Verdear Home" })).toBeVisible();
});
