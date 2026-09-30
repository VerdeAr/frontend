import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { CartItemList, CartSummary, DeliverySelector } from "@/components/cart";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
	const items = useCartStore(selectCartItems);
	const itemCount = useCartStore(selectCartItemCount);
	const subtotal = useCartStore(selectCartSubtotal);
	const shipping = useCartStore(selectCartShipping);
	const total = useCartStore(selectCartTotal);
	const deliveryType = useCartStore(selectDeliveryType);
	const isLoading = useCartStore((state) => state.isLoading);
	const isUpdating = useCartStore((state) => state.isUpdating);
	const fetchCart = useCartStore((state) => state.fetchCart);
	const updateQuantity = useCartStore((state) => state.updateQuantity);
	const removeItem = useCartStore((state) => state.removeItem);
	const clearCart = useCartStore((state) => state.clearCart);
	const setDeliveryType = useCartStore((state) => state.setDeliveryType);

	const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
	const [isClearingCart, setIsClearingCart] = useState(false);

	useEffect(() => {
		fetchCart();
	}, [fetchCart]);

	const handleClearCartRequest = async () => {
		setIsConfirmClearOpen(true);
	};

	const handleConfirmClear = async () => {
		try {
			setIsClearingCart(true);
			await clearCart();
		} finally {
			setIsClearingCart(false);
			setIsConfirmClearOpen(false);
		}
	};

	const handleCancelClear = () => {
		setIsConfirmClearOpen(false);
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
								onClearCart={
									items.length > 0 ? handleClearCartRequest : undefined
								}
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

			{/* Diálogo de confirmação para esvaziar carrinho com ShadCN */}
			<AlertDialog
				open={isConfirmClearOpen}
				onOpenChange={(open) => !open && handleCancelClear()}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Esvaziar carrinho</AlertDialogTitle>
						<AlertDialogDescription>
							Deseja realmente remover todos os itens do seu carrinho? Essa ação
							não pode ser desfeita.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel
							onClick={handleCancelClear}
							disabled={isClearingCart}
						>
							Cancelar
						</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							onClick={handleConfirmClear}
							disabled={isClearingCart}
						>
							{isClearingCart ? "Esvaziando..." : "Esvaziar"}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
