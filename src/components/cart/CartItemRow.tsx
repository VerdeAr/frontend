import { Minus, Plus, Sprout, Store, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { formatBRL } from "@/lib/formatters";
import type { CartItemWithProduct } from "@/types";

export interface CartItemRowProps {
	item: CartItemWithProduct;
	onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
	onRemoveItem: (itemId: string) => Promise<void>;
	isUpdating?: boolean;
}

export function CartItemRow({
	item,
	onUpdateQuantity,
	onRemoveItem,
	isUpdating = false,
}: CartItemRowProps) {
	const [imageError, setImageError] = useState(false);
	const [localLoading, setLocalLoading] = useState(false);

	const isMaxStock = item.quantity >= item.product.stock;
	const isMinQuantity = item.quantity <= 1;
	const isActionDisabled = isUpdating || localLoading;

	const handleDecrement = async () => {
		if (isMinQuantity || isActionDisabled) return;
		try {
			setLocalLoading(true);
			await onUpdateQuantity(item.id, item.quantity - 1);
		} finally {
			setLocalLoading(false);
		}
	};

	const handleIncrement = async () => {
		if (isMaxStock || isActionDisabled) return;
		try {
			setLocalLoading(true);
			await onUpdateQuantity(item.id, item.quantity + 1);
		} finally {
			setLocalLoading(false);
		}
	};

	const handleRemove = async () => {
		if (isActionDisabled) return;
		try {
			setLocalLoading(true);
			await onRemoveItem(item.id);
		} finally {
			setLocalLoading(false);
		}
	};

	const sellerName =
		item.product.seller?.farm_name ||
		item.product.seller?.user?.name ||
		"Produtor Local";

	const unitSymbol =
		item.product.measurement_unit?.symbol ||
		item.product.measurement_unit?.name;

	return (
		<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-card border border-border/60 hover:border-border transition-colors">
			{/* Left: Thumbnail & Product Details */}
			<div className="flex items-center gap-3.5 min-w-0">
				{/* Thumbnail */}
				<div className="relative size-18 sm:size-20 shrink-0 overflow-hidden rounded-xl bg-muted/60 border border-border/50">
					{item.product.image_url && !imageError ? (
						<img
							src={item.product.image_url}
							alt={item.product.name}
							onError={() => setImageError(true)}
							className="size-full object-cover"
							loading="lazy"
						/>
					) : (
						<div className="size-full flex items-center justify-center text-muted-foreground/50">
							<Sprout className="size-8" />
						</div>
					)}
				</div>

				{/* Info */}
				<div className="flex flex-col min-w-0 gap-1">
					<h3 className="text-sm sm:text-base font-semibold text-foreground truncate">
						{item.product.name}
					</h3>

					<div className="flex items-center gap-1.5 text-xs text-muted-foreground">
						<Store className="size-3.5 shrink-0" />
						<span className="truncate">{sellerName}</span>
					</div>

					<div className="flex items-center gap-2 mt-0.5">
						<span className="text-xs sm:text-sm font-medium text-foreground">
							{formatBRL(item.price)}
							{unitSymbol && (
								<span className="text-xs text-muted-foreground ml-1">
									/{unitSymbol}
								</span>
							)}
						</span>

						{isMaxStock && (
							<Badge
								variant="secondary"
								className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
							>
								Estoque máx.
							</Badge>
						)}
					</div>
				</div>
			</div>

			{/* Right: Quantity Stepper, Subtotal & Delete Button */}
			<div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 pt-3 sm:pt-0 border-t border-border/40 sm:border-t-0">
				{/* Stepper Controls */}
				<div className="flex items-center rounded-xl border border-input bg-background shadow-2xs">
					<button
						type="button"
						onClick={handleDecrement}
						disabled={isMinQuantity || isActionDisabled}
						className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-l-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						aria-label={`Diminuir quantidade de ${item.product.name}`}
					>
						<Minus className="size-4" />
					</button>

					<span className="min-w-9 text-center font-semibold text-sm sm:text-base select-none text-foreground">
						{item.quantity}
					</span>

					<button
						type="button"
						onClick={handleIncrement}
						disabled={isMaxStock || isActionDisabled}
						className="flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-r-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
						aria-label={`Aumentar quantidade de ${item.product.name}`}
					>
						<Plus className="size-4" />
					</button>
				</div>

				{/* Item Subtotal */}
				<div className="text-right min-w-20">
					<span className="text-xs text-muted-foreground block sm:hidden">
						Subtotal
					</span>
					<span className="text-sm sm:text-base font-bold text-foreground">
						{formatBRL(item.total)}
					</span>
				</div>

				{/* Delete Action Button */}
				<button
					type="button"
					onClick={handleRemove}
					disabled={isActionDisabled}
					className="flex h-11 w-11 items-center justify-center rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
					aria-label={`Remover ${item.product.name} do carrinho`}
				>
					<Trash2 className="size-4.5" />
				</button>
			</div>
		</div>
	);
}
