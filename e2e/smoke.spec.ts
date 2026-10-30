import { expect, test } from "@playwright/test";
import { seedSellerWithProduct } from "./helpers/api.ts";

test("a vitrine carrega a partir do build em preview", async ({ page }) => {
	await page.goto("/");

	await expect(page.getByRole("link", { name: "Verdear Home" })).toBeVisible();
});

test("a API de testes cria vendedor e produto, e a vitrine o exibe", async ({
	page,
}) => {
	const { product } = await seedSellerWithProduct();

	await page.goto(`/?q=${encodeURIComponent(product.name)}`);

	await expect(page.getByText(product.name).first()).toBeVisible();
});
