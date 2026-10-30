import {
	type APIRequestContext,
	type APIResponse,
	request,
} from "@playwright/test";
import { buildSeller, type TestSeller, uniqueSuffix } from "./data.ts";
import { resolveApiUrl } from "./env.ts";

export interface SeededProduct {
	id: string;
	name: string;
	price: number;
	stock: number;
}

export interface SeededSeller {
	seller: TestSeller;
	shippingRate: number;
	product: SeededProduct;
}

export interface SeedOptions {
	price?: number;
	stock?: number;
	shippingRate?: number;
}

// Falha com a resposta da API, para o erro do teste dizer o que deu errado
async function expectOk(
	response: APIResponse,
	action: string,
): Promise<unknown> {
	if (!response.ok()) {
		throw new Error(
			`Falha ao ${action}: ${response.status()} ${await response.text()}`,
		);
	}
	return response.json();
}

async function firstId(
	api: APIRequestContext,
	path: string,
	action: string,
): Promise<string> {
	const list = (await expectOk(await api.get(path), action)) as {
		id: string;
	}[];

	if (list.length === 0) {
		throw new Error(
			`${action}: a lista está vazia. O seed do banco de testes foi executado?`,
		);
	}
	return list[0].id;
}

/**
 * Cadastra um vendedor, define o frete fixo e publica um produto ativo, tudo por chamadas
 * diretas à API. O contexto guarda o cookie de sessão do vendedor, como um navegador faria.
 */
export async function seedSellerWithProduct(
	options: SeedOptions = {},
): Promise<SeededSeller> {
	const price = options.price ?? 8.5;
	const stock = options.stock ?? 10;
	const shippingRate = options.shippingRate ?? 12.5;

	const suffix = uniqueSuffix();
	const seller = buildSeller(suffix);
	const api = await request.newContext({ baseURL: resolveApiUrl() });

	try {
		await expectOk(
			await api.post("/auth/register", {
				data: {
					name: seller.name,
					email: seller.email,
					password: seller.password,
					cpf: seller.cpf,
					role: "VENDEDOR",
					phone: seller.phone,
					address: seller.address,
					cnpj: seller.cnpj,
					farm_name: seller.farmName,
					description: seller.description,
				},
			}),
			"cadastrar o vendedor",
		);

		await expectOk(
			await api.put("/pessoa/frete", {
				data: { fixed_shipping_rate: shippingRate },
			}),
			"definir o frete do vendedor",
		);

		const categoryId = await firstId(api, "/categorias", "listar categorias");
		const unitId = await firstId(
			api,
			"/unidades-medida",
			"listar unidades de medida",
		);

		const name = `Tomate E2E ${suffix}`;
		const created = (await expectOk(
			await api.post("/vendedor/produtos", {
				data: {
					name,
					price,
					stock,
					category_id: categoryId,
					measurement_unit_id: unitId,
					description: "Produto criado pelos testes E2E",
				},
			}),
			"criar o produto",
		)) as { id: string };

		return {
			seller,
			shippingRate,
			product: { id: created.id, name, price, stock },
		};
	} finally {
		await api.dispose();
	}
}
