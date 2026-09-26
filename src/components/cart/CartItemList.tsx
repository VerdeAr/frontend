import { Trash2 } from "lucide-react";
import type { CartItemWithProduct } from "@/types";
import { CartEmptyState } from "./CartEmptyState";
import { CartItemRow } from "./CartItemRow";

export interface CartItemListProps {
	items: CartItemWithProduct[];
	onUpdateQuantity: (itemId: string, quantity: number) => Promise<void>;
	onRemoveItem: (itemId: string) => Promise<void>;
	onClearCart?: () => Promise<void>;
	isUpdating?: boolean;
}

export function CartItemList({
	items,
	onUpdateQuantity,
	onRemoveItem,
	onClearCart,
	isUpdating = false,
}: CartItemListProps) {
	if (items.length === 0) {
		return <CartEmptyState />;
	}

	return (
		<div className="flex flex-col gap-4">
			{/* Header with items count and clear cart button */}
			<div className="flex items-center justify-between pb-2 border-b border-border/60">
				<span className="text-sm font-medium text-muted-foreground">
					{items.length} {items.length === 1 ? "produto" : "produtos"}{" "}
					selecionados
				</span>

				{onClearCart && (
					<button
						type="button"
						onClick={onClearCart}
						disabled={isUpdating}
						className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 py-2 px-1"
					>
						<Trash2 className="size-3.5" />
						<span>Esvaziar carrinho</span>
					</button>
				)}
			</div>

			{/* List of Item Rows */}
			<div className="flex flex-col gap-3">
				{items.map((item) => (
					<CartItemRow
						key={item.id}
						item={item}
						onUpdateQuantity={onUpdateQuantity}
						onRemoveItem={onRemoveItem}
						isUpdating={isUpdating}
					/>
				))}
			</div>
		</div>
	);
}
