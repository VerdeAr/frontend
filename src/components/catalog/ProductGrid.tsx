import { PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";
import { ProductSkeleton } from "./ProductSkeleton";

export interface ProductGridProps {
	products?: Product[];
	isLoading?: boolean;
	skeletonCount?: number;
	onAddToCart?: (product: Product) => void;
	onProductClick?: (product: Product) => void;
	emptyTitle?: string;
	emptyMessage?: string;
	onResetFilters?: () => void;
	className?: string;
}

export function ProductGrid({
	products = [],
	isLoading = false,
	skeletonCount = 8,
	onAddToCart,
	onProductClick,
	emptyTitle = "Nenhum produto encontrado",
	emptyMessage = "Não encontramos produtos para os filtros ou busca aplicados. Tente ajustar os termos ou selecionar outra categoria.",
	onResetFilters,
	className,
}: ProductGridProps) {
	// Estado de carregamento com Skeletons
	if (isLoading) {
		return (
			<div
				className={cn(
					"grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6",
					className,
				)}
			>
				{Array.from({ length: skeletonCount }).map((_, index) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: Skeletons são estáticos para loading state
					<ProductSkeleton key={`skeleton-${index}`} />
				))}
			</div>
		);
	}

	// Estado vazio (Empty state)
	if (products.length === 0) {
		return (
			<div className="flex w-full flex-col items-center justify-center rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 sm:p-12 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-4">
					<PackageSearch className="size-8" />
				</div>
				<h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
					{emptyTitle}
				</h3>
				<p className="max-w-md text-xs sm:text-sm text-muted-foreground mb-6">
					{emptyMessage}
				</p>
				{onResetFilters && (
					<Button
						type="button"
						variant="outline"
						onClick={onResetFilters}
						className="h-11 rounded-2xl px-5 text-sm font-medium border-border/80 hover:bg-muted/60 gap-2"
					>
						<RotateCcw className="size-4" />
						<span>Limpar Filtros</span>
					</Button>
				)}
			</div>
		);
	}

	// Grade de Produtos
	return (
		<div
			className={cn(
				"grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-6",
				className,
			)}
		>
			{products.map((product) => (
				<ProductCard
					key={product.id}
					product={product}
					onAddToCart={onAddToCart}
					onClick={onProductClick}
				/>
			))}
		</div>
	);
}
