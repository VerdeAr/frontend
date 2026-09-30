import {
	ArrowRight,
	CheckCircle2,
	Clock,
	Loader2,
	ShoppingBag,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router";
import {
	OrderItemsList,
	OrderPaymentInstructions,
} from "@/components/checkout";
import { buttonVariants } from "@/components/ui/button";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { saleService } from "@/services/sale.service";
import type { SaleResponse } from "@/types";

export default function OrderSuccessPage() {
	const { id } = useParams<{ id: string }>();
	const location = useLocation();

	const stateSale = location.state?.sale as SaleResponse | undefined;
	const [sale, setSale] = useState<SaleResponse | null>(stateSale || null);
	const [isLoading, setIsLoading] = useState(!stateSale);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (sale || !id) return;

		let isMounted = true;
		setIsLoading(true);

		saleService
			.getPurchaseById(id)
			.then((data) => {
				if (isMounted) {
					setSale(data);
				}
			})
			.catch((err) => {
				console.error("Erro ao carregar detalhes da compra:", err);
				if (isMounted) {
					setError("Não foi possível carregar os detalhes deste pedido.");
				}
			})
			.finally(() => {
				if (isMounted) {
					setIsLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [id, sale]);

	if (isLoading) {
		return (
			<div className="flex min-h-[60vh] items-center justify-center">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error || !sale) {
		return (
			<div className="mx-auto max-w-md py-16 px-4 text-center">
				<h2 className="text-xl font-bold text-foreground mb-2">
					Pedido não encontrado
				</h2>
				<p className="text-sm text-muted-foreground mb-6">
					{error ||
						"Não conseguimos localizar as informações do pedido solicitado."}
				</p>
				<Link
					to="/minha-conta"
					className={cn(buttonVariants({ variant: "default" }), "h-11 px-6")}
				>
					Ir para Minha Conta
				</Link>
			</div>
		);
	}

	const paymentMethodName =
		sale.payments?.[0]?.payment_method || "Não especificado";

	return (
		<div className="relative min-h-[calc(100vh-8rem)] py-8 px-4 sm:px-6 lg:px-8">
			{/* Ambient Glow */}
			<div
				className="pointer-events-none absolute inset-x-0 -top-20 -z-10 h-80 bg-linear-to-b from-emerald-500/15 via-emerald-500/5 to-transparent blur-3xl"
				aria-hidden="true"
			/>

			<div className="mx-auto max-w-3xl flex flex-col gap-8">
				{/* Success Banner Header */}
				<div className="flex flex-col items-center text-center gap-3">
					<div className="flex size-18 items-center justify-center rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-xs">
						<CheckCircle2 className="size-10" />
					</div>

					<div className="space-y-1">
						<span className="text-xs font-semibold text-primary uppercase tracking-wider">
							Pedido Confirmado
						</span>
						<h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
							Obrigado pela sua compra!
						</h1>
						<p className="text-sm text-muted-foreground max-w-md">
							Seu pedido foi registrado e os produtores rurais já foram
							notificados para separar seus produtos frescos.
						</p>
					</div>

					{/* Metadata bar */}
					<div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground pt-1">
						<span>
							Código:{" "}
							<strong className="text-foreground">
								#{sale.id.slice(0, 8).toUpperCase()}
							</strong>
						</span>
						<span>•</span>
						<span>
							Data:{" "}
							<strong className="text-foreground">
								{formatDate(sale.created_at)}
							</strong>
						</span>
						<span>•</span>
						<span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
							<Clock className="size-3" />
							Aguardando preparo
						</span>
					</div>
				</div>

				{/* Content Grid: Instructions & Items */}
				<div className="flex flex-col gap-6">
					<OrderPaymentInstructions
						paymentMethod={paymentMethodName}
						totalAmount={sale.total_amount}
					/>

					<OrderItemsList
						items={sale.items || []}
						deliveryType={sale.delivery_type}
						totalAmount={sale.total_amount}
					/>
				</div>

				{/* Action CTAs */}
				<div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
					<Link
						to="/minha-conta?aba=purchases"
						className={cn(
							buttonVariants({ variant: "default" }),
							"w-full sm:w-auto h-11 px-6 rounded-xl font-semibold shadow-xs gap-2",
						)}
					>
						<span>Acompanhar em Minhas Compras</span>
						<ArrowRight className="size-4" />
					</Link>

					<Link
						to="/#produtos"
						className={cn(
							buttonVariants({ variant: "outline" }),
							"w-full sm:w-auto h-11 px-6 rounded-xl font-medium gap-2",
						)}
					>
						<ShoppingBag className="size-4" />
						<span>Continuar Comprando</span>
					</Link>
				</div>
			</div>
		</div>
	);
}
