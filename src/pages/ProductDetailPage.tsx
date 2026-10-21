import {
	ArrowLeft,
	CheckCircle2,
	ChevronRight,
	PackageSearch,
	RotateCcw,
} from "lucide-react";
import { useState } from "react";
import { Link, useLoaderData, useLocation, useNavigate } from "react-router";
import {
	ProductActionsBar,
	ProductGallery,
	ProductHeaderInfo,
	ProductSellerCard,
	ProductShippingSimulator,
} from "@/components/pdp";
import { Button } from "@/components/ui/button";
import type { ProductDetailLoaderData } from "@/router/loaders";
import { useAuthStore } from "@/stores/auth.store";
import { useCartStore } from "@/stores/cart.store";

export default function ProductDetailPage() {
	const { product, neighborhoods, error } =
		useLoaderData<ProductDetailLoaderData>();
	const navigate = useNavigate();
	const location = useLocation();

	const [quantity, setQuantity] = useState(1);
	const [isAdding, setIsAdding] = useState(false);
	const [cartFeedback, setCartFeedback] = useState<string | null>(null);

	const handleAddToCart = async () => {
		if (!product) return;

		const { isAuthenticated } = useAuthStore.getState();
		if (!isAuthenticated) {
			navigate("/login", { state: { from: location } });
			return;
		}

		try {
			setIsAdding(true);
			await useCartStore.getState().addItem(product.id, quantity);
			setCartFeedback(
				`${quantity}x "${product.name}" adicionado à sua sacola com sucesso!`,
			);
			setTimeout(() => {
				setCartFeedback(null);
			}, 3500);
		} catch (err) {
			console.error("Erro ao adicionar produto ao carrinho:", err);
		} finally {
			setIsAdding(false);
		}
	};

	// Estado de Erro ou Produto Não Encontrado
	if (error || !product) {
		return (
			<div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/60 p-8 py-16 text-center my-8">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-4">
					<PackageSearch className="size-8" />
				</div>
				<h1 className="text-lg font-bold text-foreground sm:text-xl mb-1">
					Produto não encontrado
				</h1>
				<p className="max-w-md text-xs sm:text-sm text-muted-foreground mb-6">
					{error ||
						"O produto que você procura não está mais disponível ou foi desativado pelo produtor."}
				</p>
				<Button
					type="button"
					variant="outline"
					onClick={() => navigate("/")}
					className="h-11 rounded-2xl px-5 text-sm font-medium gap-2 border-border/80 hover:bg-muted/60"
				>
					<RotateCcw className="size-4" />
					<span>Voltar ao Catálogo</span>
				</Button>
			</div>
		);
	}

	const isOutOfStock = product.stock <= 0 || !product.is_active;
	const isLowStock = !isOutOfStock && product.stock <= 5;
	const unitSymbol =
		product.measurement_unit?.symbol || product.measurement_unit?.name || "un";

	return (
		<div className="flex flex-col gap-6 pb-16 pt-2">
			{/* Breadcrumb e Navegação Superior */}
			<nav
				aria-label="Navegação estrutural"
				className="flex items-center gap-1.5 text-xs text-muted-foreground"
			>
				<Link
					to="/"
					className="inline-flex items-center gap-1 hover:text-foreground transition-colors font-medium"
				>
					<ArrowLeft className="size-3.5" />
					<span>Catálogo</span>
				</Link>

				<ChevronRight className="size-3.5 text-muted-foreground/60" />

				{product.category?.name && (
					<>
						<Link
							to={`/?categoria=${product.category.id}`}
							className="hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-none"
						>
							{product.category.name}
						</Link>
						<ChevronRight className="size-3.5 text-muted-foreground/60" />
					</>
				)}

				<span className="font-semibold text-foreground truncate max-w-[150px] sm:max-w-xs">
					{product.name}
				</span>
			</nav>

			{/* Layout Principal: Mobile-First em Coluna única e Desktop em 2 Colunas */}
			<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
				{/* Coluna Esquerda: Galeria e Produtor Rural em Desktop */}
				<div className="flex flex-col gap-6 lg:col-span-6">
					<ProductGallery
						imageUrl={product.image_url}
						productName={product.name}
						categoryName={product.category?.name}
						isOutOfStock={isOutOfStock}
						isLowStock={isLowStock}
						stock={product.stock}
					/>

					{/* Card do Produtor visível na coluna esquerda em telas grandes */}
					<div className="hidden lg:block">
						<ProductSellerCard seller={product.seller} />
					</div>
				</div>

				{/* Coluna Direita: Informações, Ações de Compra e Frete */}
				<div className="flex flex-col gap-6 lg:col-span-6">
					<ProductHeaderInfo
						name={product.name}
						price={product.price}
						unitSymbol={product.measurement_unit?.symbol}
						unitName={product.measurement_unit?.name}
						categoryName={product.category?.name}
						stock={product.stock}
						isActive={product.is_active}
						description={product.description}
						averageRating={product.average_rating}
						reviewCount={product.review_count}
					/>

					{/* Barra de Ações: Stepper de Quantidade e Adicionar ao Carrinho */}
					<ProductActionsBar
						price={product.price}
						stock={product.stock}
						isActive={product.is_active}
						quantity={quantity}
						onQuantityChange={setQuantity}
						onAddToCart={handleAddToCart}
						isLoading={isAdding}
						unitSymbol={unitSymbol}
					/>

					{/* Simulador de Frete com Produtor */}
					<ProductShippingSimulator
						sellerFixedShippingRate={product.seller?.user?.fixed_shipping_rate}
						neighborhoods={neighborhoods}
					/>

					{/* Card do Produtor visível abaixo das ações em telas mobile */}
					<div className="block lg:hidden">
						<ProductSellerCard seller={product.seller} />
					</div>
				</div>
			</div>

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
