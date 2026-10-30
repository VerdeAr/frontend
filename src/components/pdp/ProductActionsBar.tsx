import { AlertCircle, Minus, Plus, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";

export interface ProductActionsBarProps {
	price: number;
	stock: number;
	isActive: boolean;
	quantity: number;
	onQuantityChange: (quantity: number) => void;
	onAddToCart: () => void;
	isLoading?: boolean;
	unitSymbol?: string | null;
	className?: string;
}

export function ProductActionsBar({
	price,
	stock,
	isActive,
	quantity,
	onQuantityChange,
	onAddToCart,
	isLoading = false,
	unitSymbol,
	className,
}: ProductActionsBarProps) {
	const isOutOfStock = stock <= 0 || !isActive;
	const isMaxStock = quantity >= stock;
	const isMinQuantity = quantity <= 1;
	const subtotal = formatBRL(price * quantity);

	const handleDecrement = () => {
		if (isMinQuantity || isOutOfStock || isLoading) return;
		onQuantityChange(Math.max(1, quantity - 1));
	};

	const handleIncrement = () => {
		if (isMaxStock || isOutOfStock || isLoading) return;
		onQuantityChange(Math.min(stock, quantity + 1));
	};

	return (
		<div
			className={cn(
				"flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm sm:rounded-3xl sm:p-5",
				className,
			)}
		>
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
				{/* Seletor de Quantidade (Stepper com touch targets de 44px) */}
				<div className="flex items-center justify-between sm:justify-start gap-3">
					<span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:hidden">
						Quantidade:
					</span>

					<div className="flex items-center rounded-xl border border-border/80 bg-background shadow-2xs">
						<button
							type="button"
							onClick={handleDecrement}
							disabled={isMinQuantity || isOutOfStock || isLoading}
							className="flex h-11 w-11 items-center justify-center rounded-l-xl text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
							aria-label="Diminuir quantidade"
						>
							<Minus className="size-4" />
						</button>

						<div className="flex min-w-10 items-center justify-center px-1 font-bold text-foreground select-none">
							<span>{quantity}</span>
							{unitSymbol && (
								<span className="ml-1 text-[11px] font-normal text-muted-foreground">
									{unitSymbol}
								</span>
							)}
						</div>

						<button
							type="button"
							onClick={handleIncrement}
							disabled={isMaxStock || isOutOfStock || isLoading}
							className="flex h-11 w-11 items-center justify-center rounded-r-xl text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
							aria-label="Aumentar quantidade"
						>
							<Plus className="size-4" />
						</button>
					</div>

					{/* Subtotal Informativo */}
					<div className="flex flex-col text-right sm:text-left sm:ml-2">
						<span className="text-[11px] text-muted-foreground">Subtotal</span>
						<span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
							{subtotal}
						</span>
					</div>
				</div>

				{/* Botão de Adicionar ao Carrinho (Touch Target >= 44px) */}
				<Button
					type="button"
					variant={isOutOfStock ? "outline" : "default"}
					disabled={isOutOfStock || isLoading}
					onClick={onAddToCart}
					className={cn(
						"h-11 w-full sm:flex-1 rounded-xl sm:rounded-2xl font-semibold transition-all gap-2 text-xs sm:text-sm px-4",
						isOutOfStock
							? "opacity-60 cursor-not-allowed bg-muted/40 text-muted-foreground"
							: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs active:scale-[0.98]",
					)}
				>
					{isOutOfStock ? (
						<>
							<AlertCircle className="size-4 shrink-0" />
							<span>Produto Esgotado</span>
						</>
					) : (
						<>
							<ShoppingBag className="size-4 shrink-0" />
							<span>
								{isLoading ? "Adicionando..." : "Adicionar ao Carrinho"}
							</span>
							<span className="ml-auto font-bold opacity-90 hidden sm:inline">
								• {subtotal}
							</span>
						</>
					)}
				</Button>
			</div>
		</div>
	);
}
