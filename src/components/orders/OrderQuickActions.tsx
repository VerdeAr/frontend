import {
	CheckCircle2,
	Hourglass,
	Loader2,
	PackageOpen,
	Scale,
	Truck,
	XCircle,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
	canProposeAdjustment,
	getSellerAdvanceStatus,
	getSellerNextStatuses,
	isFinalSaleStatus,
} from "@/lib/sale-status";
import type { DeliveryType, SaleStatus, SellerTargetStatus } from "@/types";

export interface OrderQuickActionsProps {
	status: SaleStatus;
	deliveryType: DeliveryType;
	hasPendingAdjustment: boolean;
	/** Status para o qual o pedido está sendo levado no momento, ou null. */
	pendingTarget: SellerTargetStatus | null;
	onChangeStatus: (target: SellerTargetStatus) => Promise<boolean>;
	/** Abre o modal de ajuste; sem ele, o botão de ajuste não aparece. */
	onProposeAdjustment?: () => void;
}

function advanceLabel(
	target: SellerTargetStatus,
	deliveryType: DeliveryType,
): string {
	switch (target) {
		case "EM_PREPARACAO":
			return "Iniciar preparação";
		case "A_CAMINHO":
			return "Saiu para entrega";
		case "FINALIZADA":
			return deliveryType === "RETIRADA"
				? "Confirmar retirada"
				: "Confirmar entrega";
		default:
			return "Avançar";
	}
}

const ADVANCE_ICONS: Record<
	SellerTargetStatus,
	React.ComponentType<{ className?: string }>
> = {
	EM_PREPARACAO: PackageOpen,
	A_CAMINHO: Truck,
	FINALIZADA: CheckCircle2,
	CANCELADA: XCircle,
};

/** Ações do vendedor sobre o pedido, conforme o status atual (RF-52 e RF-55). */
export function OrderQuickActions({
	status,
	deliveryType,
	hasPendingAdjustment,
	pendingTarget,
	onChangeStatus,
	onProposeAdjustment,
}: OrderQuickActionsProps) {
	const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

	if (isFinalSaleStatus(status)) {
		return null;
	}

	const isWaitingCustomer =
		hasPendingAdjustment || status === "AGUARDANDO_APROVACAO_CLIENTE";
	const nextStatuses = getSellerNextStatuses(status, deliveryType);
	const advanceTarget = isWaitingCustomer
		? null
		: getSellerAdvanceStatus(status, deliveryType);
	// Recebido → Concluído direto continua permitido como atalho
	const canFinalizeDirectly =
		!isWaitingCustomer &&
		advanceTarget !== "FINALIZADA" &&
		nextStatuses.includes("FINALIZADA");
	const canCancel = nextStatuses.includes("CANCELADA");
	const showAdjustment =
		!!onProposeAdjustment && !isWaitingCustomer && canProposeAdjustment(status);
	const isBusy = pendingTarget !== null;

	const AdvanceIcon = advanceTarget ? ADVANCE_ICONS[advanceTarget] : null;

	const handleConfirmCancel = async () => {
		const succeeded = await onChangeStatus("CANCELADA");
		if (succeeded) setIsCancelDialogOpen(false);
	};

	return (
		<section
			aria-labelledby="order-actions-title"
			className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 sm:p-5 shadow-xs"
		>
			<h2
				id="order-actions-title"
				className="text-sm font-bold text-foreground"
			>
				Ações
			</h2>

			{isWaitingCustomer && (
				<p className="flex items-start gap-2 rounded-xl border border-orange-500/40 bg-orange-500/10 p-3 text-sm text-orange-800 dark:text-orange-200">
					<Hourglass className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
					<span>
						<strong className="font-semibold">
							Aguardando resposta do cliente.
						</strong>{" "}
						O pedido só pode avançar depois que o cliente aceitar o ajuste.
					</span>
				</p>
			)}

			<div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
				{advanceTarget && AdvanceIcon && (
					<Button
						type="button"
						className="h-11 px-5"
						disabled={isBusy}
						onClick={() => onChangeStatus(advanceTarget)}
					>
						{pendingTarget === advanceTarget ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<AdvanceIcon className="size-4" />
						)}
						{advanceLabel(advanceTarget, deliveryType)}
					</Button>
				)}

				{canFinalizeDirectly && (
					<Button
						type="button"
						variant="outline"
						className="h-11 px-5"
						disabled={isBusy}
						onClick={() => onChangeStatus("FINALIZADA")}
					>
						{pendingTarget === "FINALIZADA" ? (
							<Loader2 className="size-4 animate-spin" />
						) : (
							<CheckCircle2 className="size-4" />
						)}
						Concluir pedido
					</Button>
				)}

				{showAdjustment && (
					<Button
						type="button"
						variant="outline"
						className="h-11 px-5"
						disabled={isBusy}
						onClick={onProposeAdjustment}
					>
						<Scale className="size-4" />
						Propor ajuste
					</Button>
				)}

				{canCancel && (
					<Button
						type="button"
						variant="destructive"
						className="h-11 px-5 sm:ml-auto"
						disabled={isBusy}
						onClick={() => setIsCancelDialogOpen(true)}
					>
						<XCircle className="size-4" />
						Cancelar pedido
					</Button>
				)}
			</div>

			<ConfirmDialog
				open={isCancelDialogOpen}
				onOpenChange={setIsCancelDialogOpen}
				title="Cancelar este pedido?"
				description="Os produtos voltam para o seu estoque e o cliente verá o pedido como cancelado. Essa ação não pode ser desfeita."
				confirmLabel="Cancelar pedido"
				cancelLabel="Manter pedido"
				variant="destructive"
				isLoading={pendingTarget === "CANCELADA"}
				onConfirm={handleConfirmCancel}
			/>
		</section>
	);
}
