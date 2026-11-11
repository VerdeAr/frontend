import { Sprout } from "lucide-react";
import { formatBRL } from "@/lib/formatters";
import type { FormattedSaleItem } from "@/types";

export interface SellerOrderItemsListProps {
	items: FormattedSaleItem[];
	sellerSubtotal: number;
	orderTotal: number;
}

/** Itens do vendedor no pedido, com o subtotal dele e o total do pedido inteiro. */
export function SellerOrderItemsList({
	items,
	sellerSubtotal,
	orderTotal,
}: SellerOrderItemsListProps) {
	return (
		<section
			aria-labelledby="order-items-title"
			className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs"
		>
			<h2 id="order-items-title" className="text-sm font-bold text-foreground">
				Seus itens no pedido
			</h2>

			<ul className="flex flex-col divide-y divide-border/40">
				{items.map((item) => (
					<li
						key={item.id}
						className="flex items-center justify-between gap-3 py-2.5"
					>
						<div className="flex min-w-0 items-center gap-3">
							<div className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/40 bg-muted/60">
								{item.product_image ? (
									<img
										src={item.product_image}
										alt=""
										className="size-full object-cover"
									/>
								) : (
									<Sprout
										className="size-4 text-muted-foreground/60"
										aria-hidden="true"
									/>
								)}
							</div>
							<div className="flex min-w-0 flex-col">
								<span className="truncate text-sm font-semibold text-foreground">
									{item.product_name}
								</span>
								<span className="text-xs text-muted-foreground">
									{item.quantity} {item.measurement_unit || "un"} ×{" "}
									{formatBRL(item.unit_price)}
								</span>
							</div>
						</div>
						<span className="shrink-0 text-sm font-semibold text-foreground">
							{formatBRL(item.total)}
						</span>
					</li>
				))}
			</ul>

			<dl className="flex flex-col gap-1 border-t border-border/50 pt-3 text-sm">
				<div className="flex items-baseline justify-between gap-3">
					<dt className="text-muted-foreground">Subtotal dos seus itens</dt>
					<dd className="text-base font-bold text-foreground">
						{formatBRL(sellerSubtotal)}
					</dd>
				</div>
				<div className="flex items-baseline justify-between gap-3 text-xs">
					<dt className="text-muted-foreground">
						Total do pedido (com frete e outros produtores)
					</dt>
					<dd className="font-medium text-foreground">
						{formatBRL(orderTotal)}
					</dd>
				</div>
			</dl>
		</section>
	);
}
