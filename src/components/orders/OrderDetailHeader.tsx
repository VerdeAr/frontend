import { CalendarDays, CreditCard, Store, Truck } from "lucide-react";
import { formatDate } from "@/lib/formatters";
import type { SellerOrderDetail } from "@/types";
import { SaleStatusBadge } from "./SaleStatusBadge";

export interface OrderDetailHeaderProps {
	order: Pick<
		SellerOrderDetail,
		"id" | "status" | "delivery_type" | "created_at" | "payment_method"
	>;
}

/** Cabeçalho do detalhe do pedido: número, status, data, tipo de entrega e pagamento. */
export function OrderDetailHeader({ order }: OrderDetailHeaderProps) {
	const isDelivery = order.delivery_type === "ENTREGA";
	const DeliveryIcon = isDelivery ? Truck : Store;

	return (
		<header className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs">
			<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
				<div className="flex flex-col gap-0.5">
					<span className="text-xs font-semibold uppercase tracking-wider text-primary">
						Detalhe do pedido
					</span>
					<h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
						Pedido #{order.id.slice(0, 8).toUpperCase()}
					</h1>
				</div>
				<SaleStatusBadge status={order.status} className="self-start" />
			</div>

			<dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-3">
				<div className="flex items-center gap-2 text-muted-foreground">
					<CalendarDays className="size-4 shrink-0" aria-hidden="true" />
					<dt className="sr-only">Data do pedido</dt>
					<dd className="text-foreground">{formatDate(order.created_at)}</dd>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<DeliveryIcon className="size-4 shrink-0" aria-hidden="true" />
					<dt className="sr-only">Tipo de entrega</dt>
					<dd className="text-foreground">
						{isDelivery ? "Entrega no endereço" : "Retirada no local"}
					</dd>
				</div>
				<div className="flex items-center gap-2 text-muted-foreground">
					<CreditCard className="size-4 shrink-0" aria-hidden="true" />
					<dt className="sr-only">Forma de pagamento</dt>
					<dd className="text-foreground">
						{order.payment_method || "Pagamento não informado"}
					</dd>
				</div>
			</dl>
		</header>
	);
}
