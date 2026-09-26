import { AlertTriangle, Pencil, Sprout, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { formatBRL, formatStock } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export interface SellerProductCardProps {
	product: Product;
	onEdit: (product: Product) => void;
	onDelete: (productId: string) => void;
	onToggleActive: (productId: string) => void;
	isToggling?: boolean;
	isDeleting?: boolean;
}

export function SellerProductCard({
	product,
	onEdit,
	onDelete,
	onToggleActive,
	isToggling = false,
	isDeleting = false,
}: SellerProductCardProps) {
	const [imageError, setImageError] = useState(false);

	const isOutOfStock = product.stock <= 0;
	const isLowStock = !isOutOfStock && product.stock <= 5;
	const unitLabel =
		product.measurement_unit?.symbol || product.measurement_unit?.name || "un";

	const handleDelete = () => {
		if (
			window.confirm(
				`Tem certeza que deseja remover o produto "${product.name}"?`,
			)
		) {
			onDelete(product.id);
		}
	};

	return (
		<div
			className={cn(
				"relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-xs transition-all",
				!product.is_active && "opacity-80 bg-muted/20",
			)}
		>
			<div className="flex gap-3.5 items-start">
				{/* Thumbnail */}
				<div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted/30 border border-border/40">
					{product.image_url && !imageError ? (
						<img
							src={product.image_url}
							alt={product.name}
							loading="lazy"
							onError={() => setImageError(true)}
							className="size-full object-cover"
						/>
					) : (
						<div className="flex size-full items-center justify-center bg-emerald-500/10 text-emerald-600">
							<Sprout className="size-7" />
						</div>
					)}
				</div>

				{/* Informações Principais */}
				<div className="flex flex-1 flex-col min-w-0">
					<div className="flex items-center gap-2 mb-0.5">
						{product.category?.name && (
							<span className="text-[11px] font-medium text-muted-foreground truncate">
								{product.category.name}
							</span>
						)}
					</div>

					<h4 className="text-sm font-semibold text-foreground truncate">
						{product.name}
					</h4>

					{/* Preço e Unidade */}
					<div className="mt-1 flex items-baseline gap-1">
						<span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
							{formatBRL(product.price)}
						</span>
						<span className="text-xs text-muted-foreground">/ {unitLabel}</span>
					</div>

					{/* Badge de Estoque */}
					<div className="mt-1.5 flex items-center gap-2">
						{isOutOfStock ? (
							<Badge
								variant="destructive"
								className="text-[10px] px-1.5 py-0.5"
							>
								Esgotado (0 {unitLabel})
							</Badge>
						) : isLowStock ? (
							<Badge
								variant="outline"
								className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400 text-[10px] px-1.5 py-0.5 gap-1"
							>
								<AlertTriangle className="size-3" />
								<span>Restam {formatStock(product.stock, unitLabel)}</span>
							</Badge>
						) : (
							<span className="text-xs text-muted-foreground">
								Estoque:{" "}
								<strong className="text-foreground">
									{formatStock(product.stock, unitLabel)}
								</strong>
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Barra Inferior: Switch de Status e Ações */}
			<div className="mt-4 pt-3 border-t border-border/40 flex items-center justify-between gap-2">
				{/* Toggle Ativo/Inativo */}
				<div className="flex items-center gap-2">
					<Switch
						checked={product.is_active}
						onCheckedChange={() => onToggleActive(product.id)}
						disabled={isToggling}
						aria-label={`Alternar status ativo do produto ${product.name}`}
					/>
					<span className="text-xs font-medium text-muted-foreground">
						{product.is_active ? "Ativo na Loja" : "Pausado"}
					</span>
				</div>

				{/* Botões de Ação com Touch Target >= 44px */}
				<div className="flex items-center gap-1.5">
					<Button
						type="button"
						variant="outline"
						size="sm"
						onClick={() => onEdit(product)}
						className="h-11 px-3 rounded-xl gap-1 text-xs font-medium"
						aria-label={`Editar ${product.name}`}
					>
						<Pencil className="size-3.5" />
						<span>Editar</span>
					</Button>

					<Button
						type="button"
						variant="ghost"
						size="sm"
						disabled={isDeleting}
						onClick={handleDelete}
						className="h-11 w-11 p-0 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive"
						aria-label={`Excluir ${product.name}`}
					>
						<Trash2 className="size-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
