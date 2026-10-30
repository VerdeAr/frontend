import type { CartResponse, Product, User } from "@/types";

// Dados de exemplo tipados, usados pelos testes de stores e de componentes

export function criarUsuario(sobrescrever: Partial<User> = {}): User {
	return {
		id: "usuario-1",
		name: "Maria da Silva",
		email: "maria@verdear.dev",
		role: "CLIENTE",
		is_active: true,
		...sobrescrever,
	};
}

export function criarProduto(sobrescrever: Partial<Product> = {}): Product {
	return {
		id: "produto-1",
		seller_id: "vendedor-1",
		name: "Alface Crespa",
		price: 4.5,
		stock: 10,
		is_active: true,
		...sobrescrever,
	};
}

export function criarCarrinho(
	sobrescrever: Partial<CartResponse> = {},
): CartResponse {
	return {
		id: "carrinho-1",
		user_id: "usuario-1",
		delivery_type: null,
		payment_method: null,
		items: [],
		subtotal: 0,
		shipping: 0,
		total: 0,
		total_items: 0,
		...sobrescrever,
	};
}

export function criarCarrinhoComItem(
	sobrescrever: Partial<CartResponse> = {},
): CartResponse {
	return criarCarrinho({
		items: [
			{
				id: "item-1",
				cart_id: "carrinho-1",
				product_id: "produto-1",
				product: criarProduto(),
				quantity: 2,
				price: 4.5,
				total: 9,
			},
		],
		subtotal: 9,
		shipping: 12.5,
		total: 21.5,
		total_items: 2,
		delivery_type: "ENTREGA",
		payment_method: "PIX",
		...sobrescrever,
	});
}
