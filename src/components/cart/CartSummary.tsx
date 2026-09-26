import { ArrowRight, ShieldCheck, Sprout } from "lucide-react";
import { Link } from "react-router";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { DeliveryType } from "@/types";

export interface CartSummaryProps {
	subtotal: number;
	shipping: number;
	total: number;
	deliveryType: DeliveryType | null;
	itemCount: number;
	isUpdating?: boolean;
}

export function CartSummary({
	subtotal,
	shipping,
	total,
	deliveryType,
	itemCount,
	isUpdating = false,
}: CartSummaryProps) {
	const isDeliverySelected = deliveryType !== null;
	const isCheckoutDisabled =
		!isDeliverySelected || itemCount === 0 || isUpdating;

	return (
		<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-5">
			<h2 className="text-base sm:text-lg font-bold text-foreground">
				Resumo dos Valores
			</h2>

			{/* Breakdown */}
			<div className="flex flex-col gap-3 text-sm">
				<div className="flex items-center justify-between text-muted-foreground">
					<span>Subtotal dos produtos</span>
					<span className="font-medium text-foreground">
						{formatBRL(subtotal)}
					</span>
				</div>

				<div className="flex items-center justify-between text-muted-foreground">
					<span>Frete e Entrega</span>
					{deliveryType === "RETIRADA" ? (
						<span className="font-semibold text-emerald-600 dark:text-emerald-400">
							Grátis
						</span>
					) : deliveryType === "ENTREGA" ? (
						<span className="font-medium text-foreground">
							{formatBRL(shipping)}
						</span>
					) : (
						<span className="text-xs text-muted-foreground italic">
							Selecione a modalidade
						</span>
					)}
				</div>

				<div className="h-px w-full bg-border/60 my-1" />

				<div className="flex items-baseline justify-between">
					<span className="text-base font-semibold text-foreground">
						Total a pagar
					</span>
					<span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
						{formatBRL(total)}
					</span>
				</div>
			</div>

			{/* CTA Action */}
			<div className="flex flex-col gap-2 pt-2">
				{isCheckoutDisabled ? (
					<button
						type="button"
						disabled
						className={cn(
							buttonVariants({ variant: "default" }),
							"w-full h-12 text-sm font-semibold rounded-2xl opacity-50 cursor-not-allowed",
						)}
					>
						<span>Finalizar Compra</span>
						<ArrowRight className="size-4 ml-1.5" />
					</button>
				) : (
					<Link
						to="/checkout"
						className={cn(
							buttonVariants({ variant: "default" }),
							"w-full h-12 text-sm font-semibold rounded-2xl shadow-xs transition-transform active:scale-[0.98]",
						)}
					>
						<span>Finalizar Compra</span>
						<ArrowRight className="size-4 ml-1.5" />
					</Link>
				)}

				{!isDeliverySelected && itemCount > 0 && (
					<p className="text-[11px] text-center text-amber-600 dark:text-amber-400 font-medium">
						Selecione se deseja entrega ou retirada para prosseguir.
					</p>
				)}
			</div>

			{/* Trust Badges */}
			<div className="pt-3 border-t border-border/40 flex flex-col gap-2">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<ShieldCheck className="size-4 text-primary shrink-0" />
					<span>Pagamento seguro e direto com o produtor</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Sprout className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
					<span>Apoio direto à produção familiar regional</span>
				</div>
			</div>
		</div>
	);
}
