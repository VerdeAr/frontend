import {
	AlertCircle,
	CheckCircle2,
	ChevronLeft,
	ChevronRight,
	FilterX,
	RefreshCw,
	Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router";
import {
	CategorySelector,
	HeroBannerCarousel,
	ProductGrid,
	SearchBar,
} from "@/components/catalog";
import { Button } from "@/components/ui/button";
import { catalogService } from "@/services/catalog.service";
import { useAuthStore, useCartStore } from "@/stores";
import type { Category, Product } from "@/types";

export default function Home() {
	const navigate = useNavigate();
	const location = useLocation();
	const [searchParams, setSearchParams] = useSearchParams();

	// Filtros sincronizados com a URL
	const currentCategory = searchParams.get("categoria") || null;
	const currentSearch = searchParams.get("q") || "";
	const currentPage =
		Number.parseInt(searchParams.get("pagina") || "1", 10) || 1;

	// Estados locais
	const [products, setProducts] = useState<Product[]>([]);
	const [categories, setCategories] = useState<Category[]>([]);
	const [totalProducts, setTotalProducts] = useState(0);
	const [totalPages, setTotalPages] = useState(1);
	const [isLoadingProducts, setIsLoadingProducts] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [cartFeedback, setCartFeedback] = useState<string | null>(null);

	// Carrega lista de categorias na montagem
	useEffect(() => {
		let isMounted = true;
		async function loadCategories() {
			try {
				const data = await catalogService.getCategories();
				if (isMounted) {
					setCategories(data);
				}
			} catch (err) {
				console.error("Falha ao carregar categorias do catálogo:", err);
			}
		}
		loadCategories();
		return () => {
			isMounted = false;
		};
	}, []);

	// Carrega produtos com base nos filtros da URL
	useEffect(() => {
		let isMounted = true;
		async function loadProducts() {
			try {
				setIsLoadingProducts(true);
				setError(null);

				const response = await catalogService.getProducts({
					category_id: currentCategory || undefined,
					categoriaId: currentCategory || undefined,
					search: currentSearch || undefined,
					termo: currentSearch || undefined,
					page: currentPage,
					limit: 12,
					disponivel: true,
				});

				if (isMounted) {
					setProducts(response.data);
					setTotalProducts(response.total);
					setTotalPages(response.totalPages);
				}
			} catch (err) {
				if (isMounted) {
					console.error("Erro ao consultar catálogo:", err);
					setError(
						"Não foi possível carregar os produtos rurais no momento. Verifique sua conexão e tente novamente.",
					);
				}
			} finally {
				if (isMounted) {
					setIsLoadingProducts(false);
				}
			}
		}

		loadProducts();
		return () => {
			isMounted = false;
		};
	}, [currentCategory, currentSearch, currentPage]);

	// Manipuladores de Filtros e Busca
	const handleSelectCategory = (categoryId: string | null) => {
		const nextParams = new URLSearchParams(searchParams);
		if (categoryId) {
			nextParams.set("categoria", categoryId);
		} else {
			nextParams.delete("categoria");
		}
		nextParams.set("pagina", "1");
		setSearchParams(nextParams, { replace: true });
	};

	const handleSearch = (term: string) => {
		const nextParams = new URLSearchParams(searchParams);
		if (term.trim()) {
			nextParams.set("q", term.trim());
		} else {
			nextParams.delete("q");
		}
		nextParams.set("pagina", "1");
		setSearchParams(nextParams, { replace: true });
	};

	const handlePageChange = (newPage: number) => {
		if (newPage < 1 || newPage > totalPages) return;
		const nextParams = new URLSearchParams(searchParams);
		nextParams.set("pagina", newPage.toString());
		setSearchParams(nextParams);

		// Rolagem suave para a seção de catálogo
		const catalogSection = document.getElementById("produtos");
		if (catalogSection) {
			catalogSection.scrollIntoView({ behavior: "smooth" });
		}
	};

	const handleResetFilters = () => {
		setSearchParams(new URLSearchParams(), { replace: true });
	};

	const handleAddToCart = async (product: Product) => {
		const { isAuthenticated } = useAuthStore.getState();
		if (!isAuthenticated) {
			navigate("/login", { state: { from: location } });
			return;
		}

		try {
			await useCartStore.getState().addItem(product.id, 1);
			setCartFeedback(`"${product.name}" adicionado à sua sacola!`);
			setTimeout(() => {
				setCartFeedback(null);
			}, 3500);
		} catch (err) {
			console.error("Erro ao adicionar produto:", err);
		}
	};

	const selectedCategoryName = categories.find(
		(cat) => cat.id === currentCategory,
	)?.name;

	return (
		<div className="flex flex-col gap-10 sm:gap-14 pb-12">
			{/* Carrossel Hero com Destaques */}
			<HeroBannerCarousel />

			{/* Âncora e Seção Principal do Catálogo */}
			<section
				id="produtos"
				aria-label="Catálogo de Produtos Agroecológicos"
				className="scroll-mt-20 flex flex-col gap-6"
			>
				{/* Cabeçalho da Seção */}
				<div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
					<div>
						<div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
							<Sparkles className="size-3.5" />
							<span>Colheita Local & Sustentável</span>
						</div>
						<h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
							Nossos Produtos Frescos
						</h2>
						<p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
							Alimentos saudáveis colhidos com amor direto de pequenos
							produtores.
						</p>
					</div>

					{/* Contador de produtos */}
					{!isLoadingProducts && !error && (
						<div className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap self-start sm:self-auto font-medium">
							{totalProducts}{" "}
							{totalProducts === 1
								? "produto disponível"
								: "produtos disponíveis"}
						</div>
					)}
				</div>

				{/* Barra de Busca Mobile e em Destaque */}
				<div className="w-full">
					<SearchBar
						value={currentSearch}
						onSearch={handleSearch}
						placeholder="Buscar por morango, alface, mel, ovos caipiras..."
					/>
				</div>

				{/* Seletor de Categorias em Pílulas */}
				{categories.length > 0 && (
					<CategorySelector
						categories={categories}
						selectedCategoryId={currentCategory}
						onSelectCategory={handleSelectCategory}
					/>
				)}

				{/* Filtros Ativos e Limpeza Rápida */}
				{(Boolean(currentSearch) || Boolean(currentCategory)) && (
					<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
						<span className="font-medium">Filtros ativos:</span>
						{currentSearch && (
							<span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-3 py-1 font-medium text-foreground border border-border/50">
								Busca: &ldquo;{currentSearch}&rdquo;
							</span>
						)}
						{selectedCategoryName && (
							<span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-3 py-1 font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
								Categoria: {selectedCategoryName}
							</span>
						)}
						<button
							type="button"
							onClick={handleResetFilters}
							className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
						>
							<FilterX className="size-3.5" />
							<span>Limpar filtros</span>
						</button>
					</div>
				)}

				{/* Estado de Erro na Consulta */}
				{error ? (
					<div className="flex w-full flex-col items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/5 p-8 sm:p-12 text-center">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
							<AlertCircle className="size-7" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
							Erro ao carregar o catálogo
						</h3>
						<p className="max-w-md text-xs sm:text-sm text-muted-foreground mb-5">
							{error}
						</p>
						<Button
							type="button"
							variant="outline"
							onClick={() => handleSelectCategory(currentCategory)}
							className="h-11 rounded-2xl px-5 text-sm font-medium gap-2 border-border/80 hover:bg-muted/60"
						>
							<RefreshCw className="size-4" />
							<span>Tentar Novamente</span>
						</Button>
					</div>
				) : (
					/* Grade Responsiva de Produtos */
					<ProductGrid
						products={products}
						isLoading={isLoadingProducts}
						skeletonCount={8}
						onAddToCart={handleAddToCart}
						onResetFilters={handleResetFilters}
					/>
				)}

				{/* Paginação Mobile-First */}
				{totalPages > 1 && !isLoadingProducts && !error && (
					<nav
						aria-label="Paginação do catálogo"
						className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/60 pt-6"
					>
						<p className="text-xs sm:text-sm text-muted-foreground order-2 sm:order-1">
							Página{" "}
							<span className="font-semibold text-foreground">
								{currentPage}
							</span>{" "}
							de{" "}
							<span className="font-semibold text-foreground">
								{totalPages}
							</span>{" "}
							<span className="hidden sm:inline">
								({totalProducts} produtos no total)
							</span>
						</p>

						<div className="flex items-center gap-2 order-1 sm:order-2 w-full sm:w-auto justify-between sm:justify-end">
							<Button
								type="button"
								variant="outline"
								disabled={currentPage <= 1}
								onClick={() => handlePageChange(currentPage - 1)}
								className="h-11 rounded-2xl px-4 text-xs sm:text-sm font-medium gap-1.5 flex-1 sm:flex-initial"
							>
								<ChevronLeft className="size-4" />
								<span>Anterior</span>
							</Button>

							<Button
								type="button"
								variant="outline"
								disabled={currentPage >= totalPages}
								onClick={() => handlePageChange(currentPage + 1)}
								className="h-11 rounded-2xl px-4 text-xs sm:text-sm font-medium gap-1.5 flex-1 sm:flex-initial"
							>
								<span>Próxima</span>
								<ChevronRight className="size-4" />
							</Button>
						</div>
					</nav>
				)}
			</section>

			{/* Micro-feedback Flutuante de Adição ao Carrinho */}
			{cartFeedback && (
				<div
					role="status"
					className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-4 py-3 text-xs sm:text-sm font-medium text-white shadow-xl backdrop-blur-xs transition-all animate-in fade-in slide-in-from-bottom-3"
				>
					<CheckCircle2 className="size-4.5 shrink-0" />
					<span>{cartFeedback}</span>
				</div>
			)}
		</div>
	);
}
