import { ArrowLeft, Loader2, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import {
	CheckoutSummaryCard,
	DeliveryAddressCard,
	PaymentMethodSelector,
} from "@/components/checkout";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { saleService } from "@/services/sale.service";
import {
	selectCartItems,
	selectCartShipping,
	selectCartSubtotal,
	selectCartTotal,
	selectDeliveryType,
	useAuthStore,
	useCartStore,
} from "@/stores";

export default function CheckoutPage() {
	const navigate = useNavigate();
	const user = useAuthStore((state) => state.user);

	const items = useCartStore(selectCartItems);
	const subtotal = useCartStore(selectCartSubtotal);
	const shipping = useCartStore(selectCartShipping);
	const total = useCartStore(selectCartTotal);
	const deliveryType = useCartStore(selectDeliveryType);
	const isLoading = useCartStore((state) => state.isLoading);
	const fetchCart = useCartStore((state) => state.fetchCart);
	const cart = useCartStore((state) => state.cart);

	const [paymentMethod, setPaymentMethod] = useState<string>(
		cart?.payment_method || "PIX",
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	useEffect(() => {
		fetchCart();
	}, [fetchCart]);

	useEffect(() => {
		if (cart?.payment_method) {
			setPaymentMethod(cart.payment_method);
		}
	}, [cart?.payment_method]);

	const handleSubmitOrder = async () => {
		setErrorMessage(null);

		if (deliveryType === "ENTREGA" && !user?.address?.trim()) {
			setErrorMessage(
				"Para entrega em domicílio, você precisa cadastrar seu endereço no perfil antes de finalizar.",
			);
			return;
		}

		try {
			setIsSubmitting(true);
			const sale = await saleService.checkout({
				delivery_type: deliveryType || undefined,
				payment_method: paymentMethod,
			});

			// Revalida o estado do carrinho no store global
			await fetchCart();

			// Redireciona para a tela de confirmação do pedido
			navigate(`/pedido-confirmado/${sale.id}`, {
				replace: true,
				state: { sale },
			});
		} catch (error: unknown) {
			console.error("Erro ao realizar checkout:", error);
			const msg =
				error &&
				typeof error === "object" &&
				"response" in error &&
				error.response &&
				typeof error.response === "object" &&
				"data" in error.response &&
				error.response.data &&
				typeof error.response.data === "object" &&
				"message" in error.response.data &&
				typeof error.response.data.message === "string"
					? error.response.data.message
					: "Ocorreu um erro ao finalizar seu pedido. Verifique o estoque e tente novamente.";
			setErrorMessage(msg);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading && items.length === 0) {
		return (
			<div className="flex min-h-[50vh] items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (!isLoading && items.length === 0) {
		return (
			<div className="mx-auto max-w-lg py-16 px-4 text-center">
				<div className="flex size-16 mx-auto items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
					<ShoppingBag className="size-8" />
				</div>
				<h2 className="text-xl font-bold text-foreground mb-2">
					Seu carrinho está vazio
				</h2>
				<p className="text-sm text-muted-foreground mb-6">
					Adicione produtos frescos ao seu carrinho antes de prosseguir com o
					checkout.
				</p>
				<Link
					to="/#produtos"
					className={cn(buttonVariants({ variant: "default" }), "h-11 px-6")}
				>
					Voltar às compras
				</Link>
			</div>
		);
	}

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
						to="/carrinho"
						className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors group"
					>
						<ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
						<span>Voltar ao Carrinho</span>
					</Link>
				</div>

				{/* Page Heading */}
				<div className="pb-4 border-b border-border/60">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
						Finalizar Pedido
					</h1>
					<p className="text-sm text-muted-foreground mt-1">
						Revise os detalhes da entrega e confirme a forma de pagamento
					</p>
				</div>

				{/* Content Grid */}
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Left Column: Delivery Details & Payment Method */}
					<div className="lg:col-span-7 xl:col-span-8 flex flex-col gap-6">
						{user && (
							<DeliveryAddressCard user={user} deliveryType={deliveryType} />
						)}

						<PaymentMethodSelector
							selectedMethod={paymentMethod}
							onSelectMethod={setPaymentMethod}
							disabled={isSubmitting}
						/>
					</div>

					{/* Right Column: Order Summary & Confirmation CTA */}
					<div className="lg:col-span-5 xl:col-span-4 lg:sticky lg:top-24">
						<CheckoutSummaryCard
							items={items}
							subtotal={subtotal}
							shipping={shipping}
							total={total}
							deliveryType={deliveryType}
							isSubmitting={isSubmitting}
							onSubmitOrder={handleSubmitOrder}
							errorMessage={errorMessage}
						/>
					</div>
				</div>
			</div>
		</div>
	);
}
