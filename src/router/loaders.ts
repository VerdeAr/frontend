import type { LoaderFunctionArgs } from "react-router";
import { catalogService } from "@/services/catalog.service";
import { useCartStore } from "@/stores/cart.store";
import type { CartResponse, Category, Product } from "@/types";

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
	const currentCategory = url.searchParams.get("categoria") || undefined;
	const currentSearch = url.searchParams.get("q") || undefined;
	const currentPage =
		Number.parseInt(url.searchParams.get("pagina") || "1", 10) || 1;

	try {
		const [categories, productsResponse] = await Promise.all([
			catalogService.getCategories(),
			catalogService.getProducts({
				category_id: currentCategory,
				categoriaId: currentCategory,
				search: currentSearch,
				termo: currentSearch,
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
