import { Sprout, Store } from "lucide-react";
import { formatBRL } from "@/lib/formatters";
import type { DeliveryType, FormattedSaleItem } from "@/types";

export interface OrderItemsListProps {
	items: FormattedSaleItem[];
	deliveryType: DeliveryType;
	totalAmount: number;
}

export function OrderItemsList({
	items,
	deliveryType,
	totalAmount,
}: OrderItemsListProps) {
	return (
		<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-4">
			<div className="flex items-center justify-between pb-3 border-b border-border/50">
				<h3 className="font-bold text-base text-foreground">
					Itens do Pedido ({items.length})
				</h3>
				<span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
					{deliveryType === "RETIRADA"
						? "Retirada no Local"
						: "Entrega em Domicílio"}
				</span>
			</div>

			<div className="flex flex-col divide-y divide-border/40">
				{items.map((item) => (
					<div
						key={item.id}
						className="flex items-center justify-between py-3 gap-3 first:pt-0 last:pb-0"
					>
						<div className="flex items-center gap-3 min-w-0">
							<div className="size-12 rounded-xl bg-muted/60 border border-border/40 overflow-hidden shrink-0 flex items-center justify-center">
								{item.product_image ? (
									<img
										src={item.product_image}
										alt={item.product_name}
										className="size-full object-cover"
									/>
								) : (
									<Sprout className="size-5 text-muted-foreground/60" />
								)}
							</div>

							<div className="flex flex-col min-w-0">
								<span className="font-semibold text-sm text-foreground truncate">
									{item.product_name}
								</span>
								<div className="flex items-center gap-1 text-xs text-muted-foreground">
									<Store className="size-3" />
									<span className="truncate">
										{item.seller?.name || "Produtor Rural"}
									</span>
								</div>
								<span className="text-xs text-muted-foreground mt-0.5">
									{item.quantity} {item.measurement_unit || "un"} x{" "}
									{formatBRL(item.unit_price)}
								</span>
							</div>
						</div>

						<div className="text-right shrink-0">
							<span className="font-bold text-sm text-foreground">
								{formatBRL(item.total)}
							</span>
						</div>
					</div>
				))}
			</div>

			<div className="pt-3 border-t border-border/60 flex items-baseline justify-between">
				<span className="font-semibold text-sm text-foreground">
					Total do Pedido
				</span>
				<span className="text-lg font-bold text-foreground">
					{formatBRL(totalAmount)}
				</span>
			</div>
		</div>
	);
}
