import type { LoaderFunctionArgs } from "react-router";
import { z } from "zod";
import { getApiErrorStatus } from "@/lib/api-error";
import { catalogService } from "@/services/catalog.service";
import { neighborhoodService } from "@/services/neighborhood.service";
import { saleService } from "@/services/sale.service";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";
import type {
	CartResponse,
	Category,
	Neighborhood,
	Product,
	SaleResponse,
	SellerOrderDetail,
} from "@/types";

export interface HomeLoaderData {
	categories: Category[];
	products: Product[];
	totalProducts: number;
	totalPages: number;
	error: string | null;
}

export async function homeLoader({
	request,
}: LoaderFunctionArgs): Promise<HomeLoaderData> {
	const url = new URL(request.url);
	const rawCategory = url.searchParams.get("categoria");
	const isCategoryUuid =
		rawCategory && z.string().uuid().safeParse(rawCategory).success;
	const currentCategory = isCategoryUuid ? rawCategory : undefined;
	const currentSearch = url.searchParams.get("q")?.trim() || undefined;
	const currentPage =
		Number.parseInt(url.searchParams.get("pagina") || "1", 10) || 1;

	try {
		const [categories, productsResponse] = await Promise.all([
			catalogService.getCategories(),
			catalogService.getProducts({
				category_id: currentCategory,
				search: currentSearch,
				page: currentPage,
				limit: 12,
				disponivel: true,
			}),
		]);

		return {
			categories,
			products: productsResponse.data,
			totalProducts: productsResponse.total,
			totalPages: productsResponse.totalPages,
			error: null,
		};
	} catch (err) {
		console.error("Erro ao carregar dados do catálogo:", err);
		return {
			categories: [],
			products: [],
			totalProducts: 0,
			totalPages: 1,
			error:
				"Não foi possível carregar os produtos rurais no momento. Verifique sua conexão e tente novamente.",
		};
	}
}

export interface CartLoaderData {
	cart: CartResponse | null;
	error: string | null;
}

export async function cartLoader(): Promise<CartLoaderData> {
	const { isAuthenticated } = useAuthStore.getState();
	if (!isAuthenticated) {
		return { cart: null, error: null };
	}

	try {
		const cart = await useCartStore.getState().fetchCart();
		const error = useCartStore.getState().error;
		return { cart, error };
	} catch (err) {
		console.error("Erro ao carregar carrinho:", err);
		return {
			cart: null,
			error: "Não foi possível carregar os dados do carrinho.",
		};
	}
}

export interface CheckoutLoaderData {
	cart: CartResponse | null;
	error: string | null;
}

export async function checkoutLoader(): Promise<CheckoutLoaderData> {
	const { isAuthenticated } = useAuthStore.getState();
	if (!isAuthenticated) {
		return { cart: null, error: null };
	}

	try {
		const cart = await useCartStore.getState().fetchCart();
		const error = useCartStore.getState().error;
		return { cart, error };
	} catch (err) {
		console.error("Erro ao carregar dados do checkout:", err);
		return {
			cart: null,
			error: "Não foi possível carregar as informações do seu carrinho.",
		};
	}
}

export interface ProductDetailLoaderData {
	product: Product | null;
	neighborhoods: Neighborhood[];
	error: string | null;
}

export async function productDetailLoader({
	params,
}: LoaderFunctionArgs): Promise<ProductDetailLoaderData> {
	const { id } = params;

	if (!id) {
		return {
			product: null,
			neighborhoods: [],
			error: "Identificador do produto não informado.",
		};
	}

	try {
		const [product, neighborhoods] = await Promise.all([
			catalogService.getProductById(id),
			neighborhoodService.getAll().catch(() => [] as Neighborhood[]),
		]);

		return {
			product,
			neighborhoods,
			error: null,
		};
	} catch (err) {
		console.error("Erro ao carregar detalhes do produto:", err);
		return {
			product: null,
			neighborhoods: [],
			error:
				"Não foi possível encontrar as informações deste produto. Ele pode estar indisponível ou ter sido removido.",
		};
	}
}

export interface OrderSuccessLoaderData {
	sale: SaleResponse | null;
	error: string | null;
}

export async function orderSuccessLoader({
	params,
}: LoaderFunctionArgs): Promise<OrderSuccessLoaderData> {
	const { isAuthenticated } = useAuthStore.getState();
	if (!isAuthenticated) {
		return { sale: null, error: null };
	}

	const { id } = params;

	if (!id) {
		return {
			sale: null,
			error: "Identificador do pedido não informado.",
		};
	}

	try {
		const sale = await saleService.getPurchaseById(id);
		return {
			sale,
			error: null,
		};
	} catch (err) {
		console.error("Erro ao carregar detalhes do pedido:", err);
		return {
			sale: null,
			error: "Não foi possível encontrar as informações do pedido solicitado.",
		};
	}
}

export interface SellerOrderDetailLoaderData {
	order: SellerOrderDetail | null;
	error: string | null;
	/** Código HTTP do erro (403, 404...) para a página escolher a mensagem e as ações. */
	errorStatus: number | null;
}

const SELLER_ORDER_NOT_FOUND =
	"Pedido não encontrado. Ele pode ter sido removido ou o link está incorreto.";

export async function sellerOrderDetailLoader({
	params,
}: LoaderFunctionArgs): Promise<SellerOrderDetailLoaderData> {
	const { isAuthenticated, user } = useAuthStore.getState();

	// Sem sessão ou sem papel de vendedor, o ProtectedRoute e o RoleRoute redirecionam
	if (!isAuthenticated || user?.role !== "VENDEDOR") {
		return { order: null, error: null, errorStatus: null };
	}

	const { id } = params;
	if (!id || !z.string().uuid().safeParse(id).success) {
		return { order: null, error: SELLER_ORDER_NOT_FOUND, errorStatus: 404 };
	}

	try {
		const order = await saleService.getSellerOrderDetail(id);
		return { order, error: null, errorStatus: null };
	} catch (err) {
		console.error("Erro ao carregar detalhe do pedido do vendedor:", err);
		const status = getApiErrorStatus(err);

		if (status === 404) {
			return { order: null, error: SELLER_ORDER_NOT_FOUND, errorStatus: 404 };
		}

		if (status === 403) {
			return {
				order: null,
				error:
					"Este pedido não contém produtos seus, por isso você não tem acesso a ele.",
				errorStatus: 403,
			};
		}

		return {
			order: null,
			error: "Não foi possível carregar o pedido. Tente novamente.",
			errorStatus: status,
		};
	}
}
