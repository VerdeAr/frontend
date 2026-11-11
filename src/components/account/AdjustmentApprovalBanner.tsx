import {
	AlertCircle,
	ArrowRight,
	CheckCircle2,
	Loader2,
	Scale,
	XCircle,
} from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatBRL } from "@/lib/formatters";
import { saleService } from "@/services/sale.service";
import type { SaleAdjustment, SaleResponse } from "@/types";

type Decision = "accept" | "reject";

export interface AdjustmentApprovalBannerProps {
	saleId: string;
	adjustment: SaleAdjustment;
	/** Chamado com a compra atualizada pela API e a decisão tomada pelo cliente. */
	onResponded: (updatedSale: SaleResponse, accepted: boolean) => void;
}

/**
 * Banner do histórico do cliente para aceitar ou recusar o ajuste proposto pelo
 * vendedor (RF-56). Recusar cancela o pedido inteiro, por isso pede confirmação.
 */
export function AdjustmentApprovalBanner({
	saleId,
	adjustment,
	onResponded,
}: AdjustmentApprovalBannerProps) {
	const [pendingDecision, setPendingDecision] = useState<Decision | null>(null);
	const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
	const [error, setError] = useState<string | null>(null);
	// Trava síncrona contra duplo clique, antes mesmo de o estado re-renderizar.
	// Depois de uma resposta aceita pela API ela não é liberada: a proposta já foi decidida.
	const isLockedRef = useRef(false);
	const [isAnswered, setIsAnswered] = useState(false);

	const respond = async (decision: Decision) => {
		if (isLockedRef.current) return;
		isLockedRef.current = true;
		setPendingDecision(decision);
		setError(null);

		try {
			const accepted = decision === "accept";
			const updatedSale = await saleService.respondAdjustment(saleId, accepted);
			setIsAnswered(true);
			setIsRejectDialogOpen(false);
			onResponded(updatedSale, accepted);
		} catch (err) {
			console.error("Erro ao responder ajuste do pedido:", err);
			isLockedRef.current = false;
			setIsRejectDialogOpen(false);
			setError(
				getApiErrorMessage(
					err,
					"Não foi possível registrar sua resposta. Tente novamente.",
				),
			);
		} finally {
			setPendingDecision(null);
		}
	};

	const isBusy = pendingDecision !== null || isAnswered;
	const changedItems = adjustment.items.filter(
		(item) => item.original_quantity !== item.proposed_quantity,
	);

	return (
		<section
			aria-labelledby={`adjustment-title-${saleId}`}
			className="flex flex-col gap-3 rounded-xl border border-orange-500/40 bg-orange-500/10 p-3 sm:p-4"
		>
			<div className="flex items-start gap-2">
				<Scale
					className="mt-0.5 size-4 shrink-0 text-orange-700 dark:text-orange-300"
					aria-hidden="true"
				/>
				<div className="flex flex-col gap-1">
					<h3
						id={`adjustment-title-${saleId}`}
						className="text-sm font-bold text-orange-900 dark:text-orange-100"
					>
						O produtor propôs um ajuste no seu pedido
					</h3>
					<p className="text-xs text-orange-900/90 dark:text-orange-100/90">
						<span className="font-semibold">Motivo:</span> {adjustment.reason}
					</p>
				</div>
			</div>

			<ul className="flex flex-col gap-2 rounded-lg bg-background/70 p-3 text-xs">
				{changedItems.map((item) => (
					<li key={item.id} className="flex flex-col gap-0.5">
						<span className="font-semibold text-foreground">
							{item.product_name}
						</span>
						<span className="flex flex-wrap items-center gap-1.5 text-muted-foreground">
							<span className="line-through">
								{item.original_quantity} · {formatBRL(item.original_total)}
							</span>
							<ArrowRight className="size-3" aria-hidden="true" />
							<span className="font-semibold text-foreground">
								{item.proposed_quantity} · {formatBRL(item.proposed_total)}
							</span>
						</span>
					</li>
				))}
				<li className="flex flex-wrap items-baseline justify-between gap-2 border-t border-border/50 pt-2">
					<span className="text-muted-foreground">Total do pedido</span>
					<span className="flex items-center gap-1.5">
						<span className="text-muted-foreground line-through">
							{formatBRL(adjustment.current_order_total)}
						</span>
						<ArrowRight className="size-3" aria-hidden="true" />
						<span className="text-sm font-bold text-foreground">
							{formatBRL(adjustment.proposed_order_total)}
						</span>
					</span>
				</li>
			</ul>

			{error && (
				<p
					role="alert"
					className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-2.5 text-xs text-destructive"
				>
					<AlertCircle
						className="mt-0.5 size-3.5 shrink-0"
						aria-hidden="true"
					/>
					<span>{error}</span>
				</p>
			)}

			<div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
				<Button
					type="button"
					variant="outline"
					className="h-11 border-destructive/40 text-destructive hover:bg-destructive/10"
					disabled={isBusy}
					onClick={() => setIsRejectDialogOpen(true)}
				>
					<XCircle className="size-4" />
					Cancelar Pedido
				</Button>
				<Button
					type="button"
					className="h-11"
					disabled={isBusy}
					onClick={() => respond("accept")}
				>
					{pendingDecision === "accept" ? (
						<Loader2 className="size-4 animate-spin" />
					) : (
						<CheckCircle2 className="size-4" />
					)}
					Aceitar Ajuste
				</Button>
			</div>

			<ConfirmDialog
				open={isRejectDialogOpen}
				onOpenChange={setIsRejectDialogOpen}
				title="Recusar o ajuste e cancelar o pedido?"
				description="Ao recusar, o pedido inteiro é cancelado, inclusive os itens de outros produtores. Essa ação não pode ser desfeita."
				confirmLabel="Cancelar pedido"
				cancelLabel="Voltar"
				variant="destructive"
				isLoading={pendingDecision === "reject"}
				onConfirm={() => respond("reject")}
			/>
		</section>
	);
}
