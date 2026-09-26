import { AlertCircle, ShoppingBag, Sprout, Store } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatBRL, formatStock } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export interface ProductCardProps {
	product: Product;
	onAddToCart?: (product: Product) => void;
	onClick?: (product: Product) => void;
	className?: string;
	isLoadingAction?: boolean;
}

export function ProductCard({
	product,
	onAddToCart,
	onClick,
	className,
	isLoadingAction = false,
}: ProductCardProps) {
	const [imageError, setImageError] = useState(false);

	const isOutOfStock = product.stock <= 0 || !product.is_active;
	const isLowStock = !isOutOfStock && product.stock <= 5;
	const sellerName =
		product.seller?.farm_name || product.seller?.user?.name || "Produtor Local";

	const unitLabel =
		product.measurement_unit?.symbol || product.measurement_unit?.name || "un";

	const handleAddToCart = (e: React.MouseEvent) => {
		e.stopPropagation();
		if (!isOutOfStock && onAddToCart) {
			onAddToCart(product);
		}
	};

	return (
		<article
			className={cn(
				"group relative flex flex-col justify-between overflow-hidden rounded-2xl sm:rounded-3xl border border-border/60 bg-card text-card-foreground shadow-xs transition-all duration-300 hover:border-emerald-500/40 hover:shadow-md",
				className,
			)}
		>
			{/* Botão de clique global no card quando onClick fornecido */}
			{onClick && (
				<button
					type="button"
					onClick={() => onClick(product)}
					className="absolute inset-0 z-1 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
					aria-label={`Ver detalhes de ${product.name}`}
				/>
			)}

			{/* Imagem do Produto com Fallback e Badges */}
			<div className="relative aspect-square w-full overflow-hidden bg-muted/30">
				{product.image_url && !imageError ? (
					<img
						src={product.image_url}
						alt={product.name}
						loading="lazy"
						onError={() => setImageError(true)}
						className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
					/>
				) : (
					<div className="flex size-full flex-col items-center justify-center bg-radial from-emerald-500/10 to-transparent p-4 text-center">
						<div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2">
							<Sprout className="size-6" />
						</div>
						<span className="text-[11px] font-medium tracking-wide uppercase text-muted-foreground/80">
							Verdear Agro
						</span>
					</div>
				)}

				{/* Categoria do Produto */}
				{product.category?.name && (
					<div className="absolute top-2.5 left-2.5 z-2">
						<span className="inline-flex items-center rounded-full bg-background/85 px-2.5 py-0.5 text-[11px] font-medium text-foreground shadow-xs backdrop-blur-md border border-border/40">
							{product.category.name}
						</span>
					</div>
				)}

				{/* Alerta de Estoque Esgotado ou Baixo */}
				{isOutOfStock ? (
					<div className="absolute top-2.5 right-2.5 z-2">
						<Badge
							variant="destructive"
							className="rounded-full text-[10px] uppercase font-semibold px-2 py-0.5 shadow-xs"
						>
							Esgotado
						</Badge>
					</div>
				) : isLowStock ? (
					<div className="absolute top-2.5 right-2.5 z-2">
						<span className="inline-flex items-center rounded-full bg-amber-500/90 text-white px-2 py-0.5 text-[10px] font-semibold uppercase shadow-xs">
							Últimos {product.stock}
						</span>
					</div>
				) : null}
			</div>

			{/* Informações do Produto */}
			<div className="flex flex-1 flex-col justify-between p-3 sm:p-4 gap-3">
				<div>
					{/* Nome do Produtor / Fazenda */}
					<div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
						<Store className="size-3.5 shrink-0 text-emerald-600/80 dark:text-emerald-400/80" />
						<span className="truncate font-medium">{sellerName}</span>
					</div>

					{/* Título do Produto */}
					<h3 className="line-clamp-2 text-sm sm:text-base font-semibold text-foreground group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-snug">
						{product.name}
					</h3>
				</div>

				{/* Preço, Unidade e Botão de Ação */}
				<div className="pt-2 border-t border-border/40 flex flex-col gap-2.5 relative z-2">
					<div className="flex items-baseline justify-between gap-2">
						<div className="flex items-baseline gap-1">
							<span className="text-base sm:text-lg font-bold text-emerald-600 dark:text-emerald-400">
								{formatBRL(product.price)}
							</span>
							<span className="text-xs text-muted-foreground font-normal">
								/ {unitLabel}
							</span>
						</div>

						{!isOutOfStock && (
							<span className="text-[11px] text-muted-foreground hidden sm:inline">
								{formatStock(product.stock, product.measurement_unit?.symbol)}
							</span>
						)}
					</div>

					{/* Botão Adicionar ao Carrinho (Touch Target >= 44px) */}
					<Button
						type="button"
						variant={isOutOfStock ? "outline" : "default"}
						disabled={isOutOfStock || isLoadingAction}
						onClick={handleAddToCart}
						className={cn(
							"h-11 w-full rounded-xl sm:rounded-2xl font-medium transition-all gap-2 text-xs sm:text-sm",
							isOutOfStock
								? "opacity-60 cursor-not-allowed bg-muted/40 text-muted-foreground"
								: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.98]",
						)}
					>
						{isOutOfStock ? (
							<>
								<AlertCircle className="size-4 shrink-0" />
								<span>Indisponível</span>
							</>
						) : (
							<>
								<ShoppingBag className="size-4 shrink-0" />
								<span>Adicionar</span>
							</>
						)}
					</Button>
				</div>
			</div>
		</article>
	);
}
