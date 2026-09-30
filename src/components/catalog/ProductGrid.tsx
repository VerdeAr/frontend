import { PackageSearch, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
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

	// Estado vazio (Empty state) com ShadCN
	if (products.length === 0) {
		return (
			<Empty className="rounded-3xl border border-dashed border-border/80 bg-card/50 p-8 sm:p-12">
				<EmptyHeader>
					<EmptyMedia>
						<PackageSearch className="size-8" />
					</EmptyMedia>
					<EmptyTitle>{emptyTitle}</EmptyTitle>
					<EmptyDescription>{emptyMessage}</EmptyDescription>
				</EmptyHeader>
				{onResetFilters && (
					<EmptyContent>
						<Button
							type="button"
							variant="outline"
							onClick={onResetFilters}
							className="h-11 rounded-2xl px-5 text-sm font-medium border-border/80 hover:bg-muted/60 gap-2"
						>
							<RotateCcw className="size-4" />
							<span>Limpar Filtros</span>
						</Button>
					</EmptyContent>
				)}
			</Empty>
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
