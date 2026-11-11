import { Mail, MapPin, Phone, Store, User } from "lucide-react";
import type { DeliveryType, SellerOrderDetail } from "@/types";

export interface OrderCustomerCardProps {
	customer: SellerOrderDetail["customer"];
	deliveryType: DeliveryType;
}

/** Dados de contato do cliente e endereço de entrega do pedido. */
export function OrderCustomerCard({
	customer,
	deliveryType,
}: OrderCustomerCardProps) {
	const address = [customer.address, customer.neighborhood]
		.filter(Boolean)
		.join(" - ");

	return (
		<section
			aria-labelledby="order-customer-title"
			className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs"
		>
			<h2
				id="order-customer-title"
				className="text-sm font-bold text-foreground"
			>
				Cliente
			</h2>

			<div className="flex items-center gap-2 text-sm font-semibold text-foreground">
				<User className="size-4 shrink-0 text-primary" aria-hidden="true" />
				<span>{customer.name}</span>
			</div>

			<div className="flex flex-col gap-1 text-sm">
				{customer.phone && (
					<a
						href={`tel:${customer.phone.replace(/\D/g, "")}`}
						className="flex min-h-11 items-center gap-2 text-muted-foreground hover:text-foreground"
					>
						<Phone className="size-4 shrink-0" aria-hidden="true" />
						<span>{customer.phone}</span>
					</a>
				)}
				<a
					href={`mailto:${customer.email}`}
					className="flex min-h-11 items-center gap-2 break-all text-muted-foreground hover:text-foreground"
				>
					<Mail className="size-4 shrink-0" aria-hidden="true" />
					<span>{customer.email}</span>
				</a>
			</div>

			{/* O mapa da rota de entrega (VER-92) entra aqui quando estiver no main */}
			<div className="flex items-start gap-2 rounded-xl border border-border/40 bg-muted/30 p-3 text-sm">
				{deliveryType === "ENTREGA" ? (
					<>
						<MapPin
							className="mt-0.5 size-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						<div className="flex flex-col">
							<span className="text-xs font-semibold text-foreground">
								Endereço de entrega
							</span>
							<span className="text-muted-foreground">
								{address || "Endereço não informado pelo cliente"}
							</span>
						</div>
					</>
				) : (
					<>
						<Store
							className="mt-0.5 size-4 shrink-0 text-primary"
							aria-hidden="true"
						/>
						<span className="text-muted-foreground">
							O cliente vai retirar o pedido no seu local de venda.
						</span>
					</>
				)}
			</div>
		</section>
	);
}
