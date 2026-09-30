import { ArrowRight, Loader2, ShieldCheck, Sprout } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { formatBRL } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { CartItemWithProduct, DeliveryType } from "@/types";

export interface CheckoutSummaryCardProps {
	items: CartItemWithProduct[];
	subtotal: number;
	shipping: number;
	total: number;
	deliveryType: DeliveryType | null;
	isSubmitting: boolean;
	onSubmitOrder: () => void;
	errorMessage: string | null;
}

export function CheckoutSummaryCard({
	items,
	subtotal,
	shipping,
	total,
	deliveryType,
	isSubmitting,
	onSubmitOrder,
	errorMessage,
}: CheckoutSummaryCardProps) {
	return (
		<div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6 shadow-xs flex flex-col gap-5">
			<h2 className="text-base sm:text-lg font-bold text-foreground">
				Resumo do Pedido ({items.length} {items.length === 1 ? "item" : "itens"}
				)
			</h2>

			{/* Items list preview */}
			<div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
				{items.map((item) => (
					<div
						key={item.id}
						className="flex items-center justify-between text-xs py-1.5 border-b border-border/30 last:border-b-0"
					>
						<div className="flex items-center gap-2 min-w-0">
							<span className="font-semibold text-foreground truncate">
								{item.quantity}x {item.product.name}
							</span>
						</div>
						<span className="font-medium text-foreground shrink-0 ml-2">
							{formatBRL(item.total)}
						</span>
					</div>
				))}
			</div>

			{/* Financial breakdown */}
			<div className="flex flex-col gap-2.5 text-sm pt-2 border-t border-border/60">
				<div className="flex items-center justify-between text-muted-foreground">
					<span>Subtotal dos itens</span>
					<span className="font-medium text-foreground">
						{formatBRL(subtotal)}
					</span>
				</div>

				<div className="flex items-center justify-between text-muted-foreground">
					<span>Frete / Entrega</span>
					{deliveryType === "RETIRADA" ? (
						<span className="font-semibold text-emerald-600 dark:text-emerald-400">
							Grátis (Retirada)
						</span>
					) : (
						<span className="font-medium text-foreground">
							{formatBRL(shipping)}
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

			{/* Error banner */}
			{errorMessage && (
				<div className="rounded-2xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
					{errorMessage}
				</div>
			)}

			{/* Submit CTA button */}
			<button
				type="button"
				onClick={onSubmitOrder}
				disabled={isSubmitting}
				className={cn(
					buttonVariants({ variant: "default" }),
					"w-full h-12 text-sm font-semibold rounded-2xl shadow-xs transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed",
				)}
			>
				{isSubmitting ? (
					<>
						<Loader2 className="size-4 animate-spin mr-2" />
						<span>Confirmando Pedido...</span>
					</>
				) : (
					<>
						<span>Confirmar e Finalizar Pedido</span>
						<ArrowRight className="size-4 ml-1.5" />
					</>
				)}
			</button>

			{/* Trust Badges */}
			<div className="pt-2 border-t border-border/40 flex flex-col gap-2">
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<ShieldCheck className="size-4 text-primary shrink-0" />
					<span>Garantia de transação segura Verdear</span>
				</div>
				<div className="flex items-center gap-2 text-xs text-muted-foreground">
					<Sprout className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
					<span>Compra direta com pequenos produtores rurais</span>
				</div>
			</div>
		</div>
	);
}
