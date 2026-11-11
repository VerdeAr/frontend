import type { LoaderFunctionArgs } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { catalogService } from "@/services/catalog.service";
import { saleService } from "@/services/sale.service";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import { criarCarrinho, criarProduto, criarUsuario } from "@/test/fixtures";
import type { SaleResponse } from "@/types";
import {
	cartLoader,
	checkoutLoader,
	homeLoader,
	orderSuccessLoader,
} from "./loaders";

vi.mock("@/services/catalog.service", () => ({
	catalogService: {
		getCategories: vi.fn(),
		getProducts: vi.fn(),
		getProductById: vi.fn(),
	},
}));

vi.mock("@/services/sale.service", () => ({
	saleService: {
		getPurchaseById: vi.fn(),
	},
}));

const catalogo = vi.mocked(catalogService);
const venda = vi.mocked(saleService);

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});

	useAuthStore.setState({
		user: null,
		isAuthenticated: false,
		isLoading: false,
	});

	useCartStore.setState({
		cart: null,
		isLoading: false,
		isUpdating: false,
		error: null,
	});
});

describe("homeLoader: validações e consulta de catálogo", () => {
	it("ignora categoria com formato não-UUID e busca produtos sem filtro", async () => {
		catalogo.getCategories.mockResolvedValue([]);
		catalogo.getProducts.mockResolvedValue({
			data: [criarProduto()],
			total: 1,
			page: 1,
			limit: 12,
			totalPages: 1,
		});

		const request = new Request("http://localhost:3000/?categoria=abc");
		const data = await homeLoader({ request } as LoaderFunctionArgs);

		expect(catalogo.getProducts).toHaveBeenCalledWith({
			category_id: undefined,
			search: undefined,
			page: 1,
			limit: 12,
			disponivel: true,
		});
		expect(data.products).toHaveLength(1);
		expect(data.error).toBeNull();
	});

	it("aceita categoria com UUID válido e repassa ao serviço de produtos", async () => {
		catalogo.getCategories.mockResolvedValue([]);
		catalogo.getProducts.mockResolvedValue({
			data: [],
			total: 0,
			page: 1,
			limit: 12,
			totalPages: 1,
		});

		const uuidValido = "123e4567-e89b-12d3-a456-426614174000";
		const request = new Request(
			`http://localhost:3000/?categoria=${uuidValido}`,
		);
		await homeLoader({ request } as LoaderFunctionArgs);

		expect(catalogo.getProducts).toHaveBeenCalledWith({
			category_id: uuidValido,
			search: undefined,
			page: 1,
			limit: 12,
			disponivel: true,
		});
	});

	it("envia busca e paginação sem duplicar nomes de parâmetros", async () => {
		catalogo.getCategories.mockResolvedValue([]);
		catalogo.getProducts.mockResolvedValue({
			data: [],
			total: 0,
			page: 2,
			limit: 12,
			totalPages: 2,
		});

		const request = new Request("http://localhost:3000/?q=tomate&pagina=2");
		await homeLoader({ request } as LoaderFunctionArgs);

		const parametrosChamados = catalogo.getProducts.mock.calls[0][0];
		expect(parametrosChamados).toEqual({
			category_id: undefined,
			search: "tomate",
			page: 2,
			limit: 12,
			disponivel: true,
		});
		expect(parametrosChamados).not.toHaveProperty("categoriaId");
		expect(parametrosChamados).not.toHaveProperty("termo");
	});

	it("captura erros na requisição e devolve estado de erro amigável", async () => {
		catalogo.getCategories.mockRejectedValue(new Error("Falha no catálogo"));

		const request = new Request("http://localhost:3000/");
		const data = await homeLoader({ request } as LoaderFunctionArgs);

		expect(data.error).toContain(
			"Não foi possível carregar os produtos rurais",
		);
		expect(data.products).toEqual([]);
		expect(data.categories).toEqual([]);
	});
});

describe("cartLoader: proteção de sessão e carga de carrinho", () => {
	it("retorna nulo sem chamar API se o usuário não estiver autenticado", async () => {
		useAuthStore.setState({ isAuthenticated: false });
		const fetchCartSpy = vi.spyOn(useCartStore.getState(), "fetchCart");

		const data = await cartLoader();

		expect(data).toEqual({ cart: null, error: null });
		expect(fetchCartSpy).not.toHaveBeenCalled();
	});

	it("chama fetchCart quando o usuário está autenticado", async () => {
		useAuthStore.setState({ isAuthenticated: true, user: criarUsuario() });
		const carrinho = criarCarrinho();
		vi.spyOn(useCartStore.getState(), "fetchCart").mockResolvedValue(carrinho);

		const data = await cartLoader();

		expect(data.cart).toEqual(carrinho);
		expect(data.error).toBeNull();
	});

	it("captura exceção ao falhar no carregamento do carrinho", async () => {
		useAuthStore.setState({ isAuthenticated: true, user: criarUsuario() });
		vi.spyOn(useCartStore.getState(), "fetchCart").mockRejectedValue(
			new Error("Falha de rede"),
		);

		const data = await cartLoader();

		expect(data.cart).toBeNull();
		expect(data.error).toBe("Não foi possível carregar os dados do carrinho.");
	});
});

describe("checkoutLoader: proteção de sessão e carga de dados de checkout", () => {
	it("retorna nulo sem chamar API se o usuário não estiver autenticado", async () => {
		useAuthStore.setState({ isAuthenticated: false });
		const fetchCartSpy = vi.spyOn(useCartStore.getState(), "fetchCart");

		const data = await checkoutLoader();

		expect(data).toEqual({ cart: null, error: null });
		expect(fetchCartSpy).not.toHaveBeenCalled();
	});

	it("carrega o carrinho com sucesso quando autenticado", async () => {
		useAuthStore.setState({ isAuthenticated: true, user: criarUsuario() });
		const carrinho = criarCarrinho();
		vi.spyOn(useCartStore.getState(), "fetchCart").mockResolvedValue(carrinho);

		const data = await checkoutLoader();

		expect(data.cart).toEqual(carrinho);
		expect(data.error).toBeNull();
	});

	it("captura exceção e devolve erro amigável caso a API falhe", async () => {
		useAuthStore.setState({ isAuthenticated: true, user: criarUsuario() });
		vi.spyOn(useCartStore.getState(), "fetchCart").mockRejectedValue(
			new Error("Erro de conexão"),
		);

		const data = await checkoutLoader();

		expect(data.cart).toBeNull();
		expect(data.error).toBe(
			"Não foi possível carregar as informações do seu carrinho.",
		);
	});
});

describe("orderSuccessLoader: proteção de sessão e carga de pedido confirmado", () => {
	it("retorna nulo sem chamar API se o usuário não estiver autenticado", async () => {
		useAuthStore.setState({ isAuthenticated: false });

		const data = await orderSuccessLoader({
			params: { id: "venda-1" },
		} as unknown as LoaderFunctionArgs);

		expect(data).toEqual({ sale: null, error: null });
		expect(venda.getPurchaseById).not.toHaveBeenCalled();
	});

	it("retorna erro amigável se params.id não for informado", async () => {
		useAuthStore.setState({ isAuthenticated: true, user: criarUsuario() });

		const data = await orderSuccessLoader({
			params: {},
		} as unknown as LoaderFunctionArgs);

		expect(data.sale).toBeNull();
		expect(data.error).toBe("Identificador do pedido não informado.");
		expect(venda.getPurchaseById).not.toHaveBeenCalled();
	});

	it("busca a compra com o ID fornecido quando autenticado", async () => {
		useAuthStore.setState({ isAuthenticated: true, user: criarUsuario() });
		const mockVenda: SaleResponse = {
			id: "venda-1",
			customer_id: "usuario-1",
			delivery_type: "ENTREGA",
			total_amount: 50,
			status: "ABERTA",
			created_at: new Date().toISOString(),
			updated_at: new Date().toISOString(),
			items: [],
			payments: [],
		};
		venda.getPurchaseById.mockResolvedValue(mockVenda);

		const data = await orderSuccessLoader({
			params: { id: "venda-1" },
		} as unknown as LoaderFunctionArgs);

		expect(venda.getPurchaseById).toHaveBeenCalledWith("venda-1");
		expect(data.sale).toEqual(mockVenda);
		expect(data.error).toBeNull();
	});

	it("retorna mensagem amigável caso a compra não seja encontrada", async () => {
		useAuthStore.setState({ isAuthenticated: true, user: criarUsuario() });
		venda.getPurchaseById.mockRejectedValue(new Error("404 Não encontrado"));

		const data = await orderSuccessLoader({
			params: { id: "venda-inexistente" },
		} as unknown as LoaderFunctionArgs);

		expect(data.sale).toBeNull();
		expect(data.error).toBe(
			"Não foi possível encontrar as informações do pedido solicitado.",
		);
	});
});
