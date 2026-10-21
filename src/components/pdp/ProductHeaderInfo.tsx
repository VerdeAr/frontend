import { AlertCircle, CheckCircle2, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatBRL, formatStock } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface ProductHeaderInfoProps {
	name: string;
	price: number;
	unitSymbol?: string | null;
	unitName?: string | null;
	stock: number;
	isActive: boolean;
	description?: string | null;
	averageRating?: number;
	reviewCount?: number;
	className?: string;
}

export function ProductHeaderInfo({
	name,
	price,
	unitSymbol,
	unitName,
	stock,
	isActive,
	description,
	averageRating,
	reviewCount,
	className,
}: ProductHeaderInfoProps) {
	const unitLabel = unitSymbol || unitName || "un";
	const isOutOfStock = stock <= 0 || !isActive;
	const isLowStock = !isOutOfStock && stock <= 5;
	const hasReviews = typeof reviewCount === "number" && reviewCount > 0;

	return (
		<div className={cn("flex w-full flex-col gap-4", className)}>
			{/* Título Principal do Produto */}
			<h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl leading-snug">
				{name}
			</h1>

			{/* Avaliação e Reputação */}
			<div className="flex items-center gap-2 text-xs sm:text-sm">
				<div className="flex items-center gap-1 text-amber-500 font-semibold">
					<Star className="size-4 fill-amber-400 text-amber-400" />
					<span>
						{typeof averageRating === "number" && averageRating > 0
							? averageRating.toFixed(1)
							: "Novo"}
					</span>
				</div>
				<span className="text-muted-foreground/60">•</span>
				<span className="text-muted-foreground">
					{hasReviews
						? `${reviewCount} ${reviewCount === 1 ? "avaliação" : "avaliações"}`
						: "Ainda sem avaliações"}
				</span>
			</div>

			{/* Bloco de Preço e Estoque */}
			<div className="flex flex-col gap-2 rounded-2xl border border-border/60 bg-card/60 p-4 shadow-xs sm:p-5">
				<div className="flex flex-wrap items-baseline gap-2">
					<span className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 sm:text-3xl">
						{formatBRL(price)}
					</span>
					<span className="text-sm font-medium text-muted-foreground">
						/ {unitLabel}
					</span>
				</div>

				<div className="flex items-center gap-2 pt-1 border-t border-border/40">
					{isOutOfStock ? (
						<Badge
							variant="destructive"
							className="rounded-full text-xs font-medium gap-1 px-2.5 py-0.5"
						>
							<AlertCircle className="size-3.5" />
							<span>Produto indisponível no momento</span>
						</Badge>
					) : isLowStock ? (
						<span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
							<AlertCircle className="size-3.5" />
							<span>
								Estoque baixo: restam apenas {formatStock(stock, unitSymbol)}
							</span>
						</span>
					) : (
						<span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
							<CheckCircle2 className="size-3.5" />
							<span>
								Disponível para entrega ({formatStock(stock, unitSymbol)})
							</span>
						</span>
					)}
				</div>
			</div>

			{/* Descrição do Produto */}
			<div className="flex flex-col gap-2 pt-1">
				<h2 className="text-xs font-semibold tracking-wider uppercase text-muted-foreground">
					Detalhes do Produto
				</h2>
				{description ? (
					<p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-line">
						{description}
					</p>
				) : (
					<p className="text-sm italic text-muted-foreground">
						Produto fresco cultivado com práticas agroecológicas sustentáveis,
						sem agrotóxicos e colhido no ponto ideal pelo produtor local.
					</p>
				)}
			</div>
		</div>
	);
}
