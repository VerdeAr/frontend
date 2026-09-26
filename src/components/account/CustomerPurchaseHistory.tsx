import {
	AlertCircle,
	CheckCircle2,
	Clock,
	ExternalLink,
	Loader2,
	ShoppingBag,
	Sprout,
	Store,
	Truck,
	XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { saleService } from "@/services/sale.service";
import type { SaleResponse, SaleStatus } from "@/types";

function renderStatusBadge(status: SaleStatus) {
	switch (status) {
		case "FINALIZADA":
			return (
				<Badge
					variant="secondary"
					className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 gap-1.5 py-1 text-xs font-semibold"
				>
					<CheckCircle2 className="size-3.5" />
					<span>Concluída</span>
				</Badge>
			);
		case "CANCELADA":
			return (
				<Badge
					variant="destructive"
					className="bg-destructive/15 text-destructive border border-destructive/30 gap-1.5 py-1 text-xs font-semibold"
				>
					<XCircle className="size-3.5" />
					<span>Cancelada</span>
				</Badge>
			);
		default:
			return (
				<Badge
					variant="secondary"
					className="bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 gap-1.5 py-1 text-xs font-semibold"
				>
					<Clock className="size-3.5" />
					<span>Aguardando preparo</span>
				</Badge>
			);
	}
}

export function CustomerPurchaseHistory() {
	const [purchases, setPurchases] = useState<SaleResponse[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let isMounted = true;
		setIsLoading(true);

		saleService
			.getMyPurchases()
			.then((data) => {
				if (isMounted) {
					setPurchases(data);
				}
			})
			.catch((err) => {
				console.error("Erro ao carregar histórico de compras:", err);
				if (isMounted) {
					setError("Não foi possível carregar seu histórico de compras.");
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
	}, []);

	if (isLoading) {
		return (
			<div className="flex min-h-64 items-center justify-center py-12">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
				<AlertCircle className="size-8 text-destructive" />
				<p className="text-sm text-destructive">{error}</p>
				<button
					type="button"
					onClick={() => window.location.reload()}
					className={cn(buttonVariants({ variant: "outline" }), "h-9 text-xs")}
				>
					Tentar novamente
				</button>
			</div>
		);
	}

	if (purchases.length === 0) {
		return (
			<div className="flex flex-col items-center justify-center py-16 px-4 text-center">
				<div className="flex size-16 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
					<ShoppingBag className="size-8" />
				</div>
				<h3 className="text-lg font-bold text-foreground mb-1">
					Nenhuma compra realizada ainda
				</h3>
				<p className="text-sm text-muted-foreground max-w-sm mb-6">
					Explore nossos produtores locais e faça seu primeiro pedido de
					alimentos frescos e sustentáveis.
				</p>
				<Link
					to="/#produtos"
					className={cn(
						buttonVariants({ variant: "default" }),
						"h-11 px-6 font-semibold",
					)}
				>
					Ver Catálogo de Produtos
				</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-6">
			<div>
				<h2 className="text-lg sm:text-xl font-bold text-foreground">
					Minhas Compras
				</h2>
				<p className="text-xs text-muted-foreground mt-0.5">
					Acompanhe o status e detalhes dos seus pedidos com os produtores
				</p>
			</div>

			<div className="flex flex-col gap-4">
				{purchases.map((purchase) => {
					const paymentMethodName =
						purchase.payments?.[0]?.payment_method || "Não especificado";

					return (
						<div
							key={purchase.id}
							className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4 transition-colors hover:border-border"
						>
							{/* Order Card Header */}
							<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
								<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
									<span className="font-bold text-sm text-foreground">
										Pedido #{purchase.id.slice(0, 8).toUpperCase()}
									</span>
									<span className="hidden sm:inline text-muted-foreground/60">
										•
									</span>
									<span className="text-xs text-muted-foreground">
										{formatDate(purchase.created_at)}
									</span>
								</div>

								<div className="flex items-center gap-2 self-start sm:self-auto">
									{renderStatusBadge(purchase.status)}
								</div>
							</div>

							{/* Delivery & Payment Badges */}
							<div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
								<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 font-medium">
									{purchase.delivery_type === "RETIRADA" ? (
										<>
											<Store className="size-3.5 text-primary" />
											<span>Retirada no Local</span>
										</>
									) : (
										<>
											<Truck className="size-3.5 text-primary" />
											<span>Entrega em Domicílio</span>
										</>
									)}
								</span>

								<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted/60 font-medium">
									<span>
										Pagamento:{" "}
										<strong className="text-foreground">
											{paymentMethodName}
										</strong>
									</span>
								</span>
							</div>

							{/* Order Items */}
							<div className="flex flex-col divide-y divide-border/40 py-1">
								{(purchase.items || []).map((item) => (
									<div
										key={item.id}
										className="flex items-center justify-between py-2.5 gap-3"
									>
										<div className="flex items-center gap-3 min-w-0">
											<div className="size-11 rounded-xl bg-muted/60 border border-border/40 overflow-hidden shrink-0 flex items-center justify-center">
												{item.product_image ? (
													<img
														src={item.product_image}
														alt={item.product_name}
														className="size-full object-cover"
													/>
												) : (
													<Sprout className="size-4 text-muted-foreground/60" />
												)}
											</div>

											<div className="flex flex-col min-w-0">
												<span className="font-semibold text-xs sm:text-sm text-foreground truncate">
													{item.product_name}
												</span>
												<span className="text-[11px] text-muted-foreground truncate">
													{item.seller?.name ? `${item.seller.name} • ` : ""}
													{item.quantity} {item.measurement_unit || "un"} x{" "}
													{formatBRL(item.unit_price)}
												</span>
											</div>
										</div>

										<span className="font-semibold text-xs sm:text-sm text-foreground shrink-0">
											{formatBRL(item.total)}
										</span>
									</div>
								))}
							</div>

							{/* Order Card Footer */}
							<div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
								<div className="flex items-baseline gap-2 self-start sm:self-auto">
									<span className="text-xs text-muted-foreground">
										Valor Total:
									</span>
									<span className="text-base font-bold text-foreground">
										{formatBRL(purchase.total_amount)}
									</span>
								</div>

								<Link
									to={`/pedido-confirmado/${purchase.id}`}
									className={cn(
										buttonVariants({ variant: "outline", size: "sm" }),
										"w-full sm:w-auto h-9 gap-1.5 text-xs font-semibold rounded-xl",
									)}
								>
									<span>Ver Comprovante</span>
									<ExternalLink className="size-3" />
								</Link>
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}
