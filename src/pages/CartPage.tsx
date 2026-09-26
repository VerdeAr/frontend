import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Link } from "react-router";
import { CartItemList } from "@/components/cart";
import { formatBRL } from "@/lib/formatters";
import {
	selectCartItemCount,
	selectCartItems,
	selectCartSubtotal,
	useCartStore,
} from "@/stores";

export default function CartPage() {
	const items = useCartStore(selectCartItems);
	const itemCount = useCartStore(selectCartItemCount);
	const subtotal = useCartStore(selectCartSubtotal);
	const isLoading = useCartStore((state) => state.isLoading);
	const isUpdating = useCartStore((state) => state.isUpdating);
	const fetchCart = useCartStore((state) => state.fetchCart);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const removeItem = useCartStore((state) => state.removeItem);
	const clearCart = useCartStore((state) => state.clearCart);

	useEffect(() => {
		fetchCart();
	}, [fetchCart]);

	const handleClearCart = async () => {
		if (window.confirm("Deseja realmente esvaziar todo o seu carrinho?")) {
			await clearCart();
		}
	};

	return (
		<div className="relative min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8">
			{/* Subtle Ambient Glow */}
			<div
				className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-80 bg-linear-to-b from-emerald-500/10 via-emerald-500/5 to-transparent blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto max-w-6xl flex flex-col gap-6">
				{/* Top Bar / Breadcrumb */}
				<div className="flex items-center justify-between">
					<Link
						to="/#produtos"
						className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
					>
						<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
						<span>Continuar comprando</span>
					</Link>

					{isUpdating && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse">
							<Loader2 className="size-3.5 animate-spin text-primary" />
							<span>Atualizando carrinho...</span>
						</div>
					)}
				</div>

				{/* Page Heading */}
				<div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-border/60">
					<div className="flex items-center gap-3">
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
							Carrinho de Compras
						</h1>
						{itemCount > 0 && (
							<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
								{itemCount} {itemCount === 1 ? "item" : "itens"}
							</span>
						)}
					</div>
				</div>

				{/* Loading State */}
				{isLoading && items.length === 0 ? (
					<div className="flex min-h-75 items-center justify-center">
						<Loader2 className="size-8 animate-spin text-primary" />
					</div>
				) : (
					/* Content Grid */
					<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
						{/* Cart Items List Column */}
						<div className="lg:col-span-7 xl:col-span-8">
							<CartItemList
								items={items}
								onUpdateQuantity={updateQuantity}
								onRemoveItem={removeItem}
								onClearCart={items.length > 0 ? handleClearCart : undefined}
								isUpdating={isUpdating}
							/>
						</div>

						{/* Summary Placeholder / Column (Subtask 3.6 will connect DeliverySelector & CartSummary) */}
						{items.length > 0 && (
							<div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
								<div className="rounded-3xl border border-border/60 bg-card/60 p-6 backdrop-blur-sm shadow-xs flex flex-col gap-4">
									<h2 className="text-lg font-bold text-foreground">
										Resumo do Pedido
									</h2>

									<div className="flex items-center justify-between text-sm py-2 border-b border-border/40">
										<span className="text-muted-foreground">Subtotal</span>
										<span className="font-semibold text-foreground">
											{formatBRL(subtotal)}
										</span>
									</div>

									<p className="text-xs text-muted-foreground">
										A modalidade de entrega e o cálculo do frete serão
										selecionados na etapa seguinte.
									</p>
								</div>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
