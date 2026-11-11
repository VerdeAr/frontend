import { expect, test } from "@playwright/test";
import { seedSellerWithProduct } from "./helpers/api.ts";
import { buildCustomer } from "./helpers/data.ts";

// Os valores vêm formatados em pt-BR (ex.: "R$ 29,50", com espaço não separável)
function brl(value: string): RegExp {
	return new RegExp(`R\\$\\s*${value}`);
}

// Duas unidades a R$ 8,50 mais R$ 12,50 de frete: subtotal R$ 17,00 e total R$ 29,50
const UNIT_PRICE = 8.5;
const SHIPPING_RATE = 12.5;

test("caminho feliz: cadastro, login, compra com entrega e pedido confirmado", async ({
	page,
}) => {
	// O vendedor e o produto nascem por chamada direta à API, não pela interface
	const { product } = await seedSellerWithProduct({
		price: UNIT_PRICE,
		stock: 10,
		shippingRate: SHIPPING_RATE,
	});
	const customer = buildCustomer();

	await test.step("cadastra um cliente com endereço", async () => {
		await page.goto("/cadastro");

		await page.getByLabel("Nome Completo").fill(customer.name);
		await page.getByLabel("E-mail").fill(customer.email);
		await page.getByLabel("CPF").fill(customer.cpf);
		await page.getByLabel("Telefone / WhatsApp").fill(customer.phone);
		await page.getByLabel("Endereço / Logradouro").fill(customer.address);
		await page.getByLabel(/^Senha/).fill(customer.password);
		await page.getByLabel(/^Confirmar Senha/).fill(customer.password);
		await page.getByRole("button", { name: "Cadastrar no Verdear" }).click();

		// O cadastro já abre a sessão e leva para a vitrine
		await expect(page).toHaveURL("/");
		await expect(
			page.getByRole("button", { name: "Sair da conta" }),
		).toBeVisible();
	});

	await test.step("sai e entra de novo com o login", async () => {
		await page.getByRole("button", { name: "Sair da conta" }).click();
		await expect(
			page.getByRole("button", { name: "Sair da conta" }),
		).toBeHidden();

		await page.goto("/login");
		await page.getByLabel("E-mail").fill(customer.email);
		await page.getByLabel(/^Senha/).fill(customer.password);
		await page.getByRole("button", { name: "Entrar na conta" }).click();

		await expect(page).toHaveURL("/");
		await expect(
			page.getByRole("button", { name: "Sair da conta" }),
		).toBeVisible();
	});

	await test.step("encontra o produto na vitrine e abre a página dele", async () => {
		await page
			.getByPlaceholder("Buscar por morango, alface, mel, ovos caipiras...")
			.fill(product.name);
		await page
			.getByRole("button", { name: `Ver detalhes de ${product.name}` })
			.click();

		await expect(page).toHaveURL(`/produtos/${product.id}`);
		await expect(
			page.getByRole("heading", { name: product.name }),
		).toBeVisible();
		await expect(page.getByText(brl("8,50")).first()).toBeVisible();
	});

	await test.step("adiciona duas unidades ao carrinho", async () => {
		await page.getByRole("button", { name: "Aumentar quantidade" }).click();

		// Espera a API confirmar o item antes de abrir o carrinho
		const itemAdded = page.waitForResponse(
			(response) =>
				response.url().endsWith("/carrinho/itens") &&
				response.request().method() === "POST" &&
				response.ok(),
		);
		await page.getByRole("button", { name: "Adicionar ao Carrinho" }).click();
		await itemAdded;

		// O rodapé também tem um link para o carrinho; usa o do cabeçalho
		await page
			.getByRole("banner")
			.getByRole("link", { name: "Carrinho de Compras" })
			.click();
		await expect(page).toHaveURL("/carrinho");
		await expect(
			page.getByRole("heading", { name: "Carrinho de Compras" }),
		).toBeVisible();
		await expect(page.getByText(product.name).first()).toBeVisible();
	});

	await test.step("escolhe entrega e confere os valores calculados pela API", async () => {
		// O rádio só marca depois que a API confirma a modalidade; por isso clica no cartão
		// visível e espera o estado final
		await page.locator("label").filter({ hasText: "Em domicílio" }).click();
		await expect(page.getByRole("radio", { name: /Entrega/ })).toBeChecked();

		await expect(
			page
				.getByText("Subtotal dos produtos")
				.locator("..")
				.getByText(brl("17,00")),
		).toBeVisible();
		await expect(
			page.getByText("Frete e Entrega").locator("..").getByText(brl("12,50")),
		).toBeVisible();
		await expect(
			page.getByText("Total a pagar").locator("..").getByText(brl("29,50")),
		).toBeVisible();

		await page.getByRole("link", { name: "Finalizar Compra" }).click();
	});

	await test.step("revisa o endereço e confirma o pedido com PIX", async () => {
		await expect(page).toHaveURL("/checkout");
		await expect(
			page.getByRole("heading", { name: "Finalizar Pedido" }),
		).toBeVisible();
		await expect(page.getByText(customer.address)).toBeVisible();
		await expect(page.getByRole("radio", { name: /PIX/ })).toBeChecked();

		await page
			.getByRole("button", { name: "Confirmar e Finalizar Pedido" })
			.click();
	});

	await test.step("vê a confirmação do pedido", async () => {
		await expect(page).toHaveURL(/\/pedido-confirmado\/.+/);
		await expect(
			page.getByRole("heading", { name: "Obrigado pela sua compra!" }),
		).toBeVisible();
		await expect(page.getByText("Entrega em Domicílio")).toBeVisible();
		await expect(page.getByText(product.name).first()).toBeVisible();
		await expect(page.getByText(brl("29,50")).first()).toBeVisible();
	});
});
