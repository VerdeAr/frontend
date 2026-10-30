import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import {
	Link,
	useLoaderData,
	useNavigation,
	useRevalidator,
} from "react-router";
import { CartItemList, CartSummary, DeliverySelector } from "@/components/cart";
import { Button } from "@/components/ui/button";
import type { CartLoaderData } from "@/router/loaders";
import {
	selectCartItemCount,
	selectCartItems,
	selectCartShipping,
	selectCartSubtotal,
	selectCartTotal,
	selectDeliveryType,
	useCartStore,
} from "@/stores";

export default function CartPage() {
	const { error } = useLoaderData<CartLoaderData>();
	const navigation = useNavigation();
	const revalidator = useRevalidator();

	const items = useCartStore(selectCartItems);
	const itemCount = useCartStore(selectCartItemCount);
	const subtotal = useCartStore(selectCartSubtotal);
	const shipping = useCartStore(selectCartShipping);
	const total = useCartStore(selectCartTotal);
	const deliveryType = useCartStore(selectDeliveryType);
	const isUpdating = useCartStore((state) => state.isUpdating);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const removeItem = useCartStore((state) => state.removeItem);
	const clearCart = useCartStore((state) => state.clearCart);
	const setDeliveryType = useCartStore((state) => state.setDeliveryType);

	const isLoading = navigation.state === "loading";

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

				{/* Loading State or Error State */}
				{error ? (
					<div className="flex w-full flex-col items-center justify-center rounded-3xl border border-destructive/30 bg-destructive/5 p-8 sm:p-12 text-center">
						<div className="flex size-14 items-center justify-center rounded-2xl bg-destructive/10 text-destructive mb-3">
							<AlertCircle className="size-7" />
						</div>
						<h3 className="text-base sm:text-lg font-semibold text-foreground mb-1">
							Erro ao carregar o carrinho
						</h3>
						<p className="max-w-md text-xs sm:text-sm text-muted-foreground mb-5">
							{error}
						</p>
						<Button
							type="button"
							variant="outline"
							onClick={() => revalidator.revalidate()}
							className="h-11 rounded-2xl px-5 text-sm font-medium gap-2 border-border/80 hover:bg-muted/60"
						>
							<RefreshCw className="size-4" />
							<span>Tentar Novamente</span>
						</Button>
					</div>
				) : isLoading && items.length === 0 ? (
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

						{/* Delivery Selection and Summary Column */}
						{items.length > 0 && (
							<div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
								<DeliverySelector
									deliveryType={deliveryType}
									onSelect={setDeliveryType}
									shipping={shipping}
									isUpdating={isUpdating}
								/>

								<CartSummary
									subtotal={subtotal}
									shipping={shipping}
									total={total}
									deliveryType={deliveryType}
									itemCount={itemCount}
									isUpdating={isUpdating}
								/>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
}
