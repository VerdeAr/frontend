import {
	CheckCircle2,
	Clock,
	Loader2,
	MapPin,
	Phone,
	Sprout,
	Store,
	Truck,
	User,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL, formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { SaleStatus, SellerOrderResponse } from "@/types";

export interface SellerOrderCardProps {
	order: SellerOrderResponse;
	onUpdateStatus: (
		orderId: string,
		status: "FINALIZADA" | "CANCELADA",
	) => Promise<void>;
}

function renderStatusBadge(status: SaleStatus) {
	switch (status) {
		case "FINALIZADA":
			return (
				<Badge
					variant="secondary"
					className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 gap-1.5 py-1 text-xs font-semibold"
				>
					<CheckCircle2 className="size-3.5" />
					<span>Finalizada</span>
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
					<span>Pendente</span>
				</Badge>
			);
	}
}

export function SellerOrderCard({
	order,
	onUpdateStatus,
}: SellerOrderCardProps) {
	const [isUpdating, setIsUpdating] = useState(false);

	const isPending = order.status === "ABERTA";

	const handleFinalize = async () => {
		if (isUpdating) return;
		try {
			setIsUpdating(true);
			await onUpdateStatus(order.id, "FINALIZADA");
		} finally {
			setIsUpdating(false);
		}
	};

	const handleCancel = async () => {
		if (isUpdating) return;
		if (
			!window.confirm(
				"Deseja realmente cancelar este pedido? Os produtos serão devolvidos ao seu estoque.",
			)
		) {
			return;
		}

		try {
			setIsUpdating(true);
			await onUpdateStatus(order.id, "CANCELADA");
		} finally {
			setIsUpdating(false);
		}
	};

	return (
		<div className="rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs flex flex-col gap-4 transition-colors hover:border-border">
			{/* Card Header */}
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/50">
				<div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
					<span className="font-bold text-sm text-foreground">
						Pedido #{order.id.slice(0, 8).toUpperCase()}
					</span>
					<span className="hidden sm:inline text-muted-foreground/60">•</span>
					<span className="text-xs text-muted-foreground">
						{formatDate(order.created_at)}
					</span>
				</div>

				<div className="flex items-center gap-2 self-start sm:self-auto">
					{renderStatusBadge(order.status)}
				</div>
			</div>

			{/* Customer & Delivery Information */}
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/30 p-3.5 rounded-xl border border-border/40">
				{/* Customer Details */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5 text-foreground font-semibold">
						<User className="size-3.5 text-primary" />
						<span>{order.customer.name}</span>
					</div>

					{order.customer.phone && (
						<div className="flex items-center gap-1.5 text-muted-foreground">
							<Phone className="size-3 text-muted-foreground/80" />
							<span>{order.customer.phone}</span>
						</div>
					)}
				</div>

				{/* Delivery Details */}
				<div className="flex flex-col gap-1.5">
					<div className="flex items-center gap-1.5 font-medium text-foreground">
						{order.delivery_type === "RETIRADA" ? (
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
					</div>

					{order.delivery_type === "ENTREGA" && order.customer.address && (
						<div className="flex items-start gap-1.5 text-muted-foreground">
							<MapPin className="size-3 shrink-0 mt-0.5 text-muted-foreground/80" />
							<span className="truncate">
								{order.customer.address}
								{order.customer.neighborhood &&
									` - ${order.customer.neighborhood}`}
							</span>
						</div>
					)}
				</div>
			</div>

			{/* Items list belonging to this seller */}
			<div className="flex flex-col divide-y divide-border/40 py-1">
				{order.items.map((item) => (
					<div
						key={item.id}
						className="flex items-center justify-between py-2 gap-3"
					>
						<div className="flex items-center gap-3 min-w-0">
							<div className="size-9 rounded-lg bg-muted/60 border border-border/40 overflow-hidden shrink-0 flex items-center justify-center">
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
								<span className="text-[11px] text-muted-foreground">
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

			{/* Footer: Seller Subtotal and Actions */}
			<div className="pt-3 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-3">
				<div className="flex items-baseline gap-2 self-start sm:self-auto">
					<span className="text-xs text-muted-foreground">
						Subtotal dos seus itens:
					</span>
					<span className="text-base font-bold text-foreground">
						{formatBRL(order.seller_subtotal)}
					</span>
				</div>

				{isPending && (
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<button
							type="button"
							onClick={handleCancel}
							disabled={isUpdating}
							className={cn(
								buttonVariants({ variant: "destructive", size: "sm" }),
								"flex-1 sm:flex-initial h-10 px-3 text-xs font-semibold rounded-xl disabled:opacity-50",
							)}
						>
							{isUpdating ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<>
									<XCircle className="size-3.5 mr-1" />
									<span>Cancelar Pedido</span>
								</>
							)}
						</button>

						<button
							type="button"
							onClick={handleFinalize}
							disabled={isUpdating}
							className={cn(
								buttonVariants({ variant: "default", size: "sm" }),
								"flex-1 sm:flex-initial h-10 px-3.5 text-xs font-semibold rounded-xl shadow-xs disabled:opacity-50",
							)}
						>
							{isUpdating ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<>
									<CheckCircle2 className="size-3.5 mr-1" />
									<span>Concluir Entrega</span>
								</>
							)}
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
