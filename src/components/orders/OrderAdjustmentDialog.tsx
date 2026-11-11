import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, ArrowRight, Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { FormTextarea } from "@/components/ui/form-input";
import { getApiErrorMessage } from "@/lib/api-error";
import { formatBRL } from "@/lib/formatters";
import {
	buildAdjustmentDefaults,
	buildAdjustmentPayload,
	calculateAdjustmentPreview,
	getChangedAdjustmentItems,
} from "@/lib/sale-adjustment";
import { cn } from "@/lib/utils";
import {
	ADJUSTMENT_REASON_MAX_LENGTH,
	type AdjustmentFormData,
	adjustmentFormSchema,
} from "@/schemas/adjustment.schema";
import { saleService } from "@/services/sale.service";
import type { FormattedSaleItem, SellerOrderDetail } from "@/types";

export interface OrderAdjustmentDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	orderId: string;
	items: FormattedSaleItem[];
	orderTotal: number;
	/** Chamado com o pedido atualizado depois que a proposta é aceita pela API. */
	onSubmitted: (order: SellerOrderDetail) => void;
}

/**
 * Modal em que o vendedor propõe ao cliente um ajuste de quantidade ou pesagem (RF-56).
 * Nada muda no pedido até o cliente aceitar; o preço unitário é mantido.
 */
export function OrderAdjustmentDialog({
	open,
	onOpenChange,
	orderId,
	items,
	orderTotal,
	onSubmitted,
}: OrderAdjustmentDialogProps) {
	const [apiError, setApiError] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		watch,
		reset,
		formState: { errors, isSubmitting },
	} = useForm<AdjustmentFormData>({
		resolver: zodResolver(adjustmentFormSchema),
		defaultValues: buildAdjustmentDefaults(items),
	});

	// Recomeça com as quantidades atuais sempre que o modal abre
	useEffect(() => {
		if (open) {
			reset(buildAdjustmentDefaults(items));
			setApiError(null);
		}
	}, [open, items, reset]);

	const reason = watch("reason") ?? "";
	const formItems = watch("items") ?? [];
	const preview = calculateAdjustmentPreview(formItems, items, orderTotal);
	const hasChanges = getChangedAdjustmentItems(formItems, items).length > 0;

	const onSubmit = async (data: AdjustmentFormData) => {
		setApiError(null);
		try {
			const updatedOrder = await saleService.proposeAdjustment(
				orderId,
				buildAdjustmentPayload(data, items),
			);
			onSubmitted(updatedOrder);
			onOpenChange(false);
		} catch (err) {
			console.error("Erro ao propor ajuste do pedido:", err);
			// Mantém o que foi digitado para o vendedor corrigir e reenviar
			setApiError(
				getApiErrorMessage(
					err,
					"Não foi possível enviar a proposta. Tente novamente.",
				),
			);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (!isSubmitting) onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="max-h-[90vh] overflow-y-auto rounded-2xl p-5 sm:max-w-lg sm:p-6">
				<DialogHeader className="gap-1.5 text-left">
					<DialogTitle className="text-lg font-bold text-foreground">
						Propor ajuste ao cliente
					</DialogTitle>
					<DialogDescription className="text-xs sm:text-sm">
						Informe a quantidade ou o peso real de cada item. O cliente precisa
						aprovar antes de qualquer mudança no pedido; o preço por unidade não
						muda.
					</DialogDescription>
				</DialogHeader>

				<form
					noValidate
					onSubmit={handleSubmit(onSubmit)}
					className="flex flex-col gap-4"
				>
					<fieldset className="flex flex-col gap-3" disabled={isSubmitting}>
						<legend className="mb-2 text-sm font-semibold text-foreground">
							Itens
						</legend>
						{items.map((item, index) => {
							const itemPreview = preview.items[index];
							const quantityError = errors.items?.[index]?.quantity?.message;
							const inputId = `adjustment-quantity-${item.id}`;
							const unit = item.measurement_unit || "un";

							return (
								<div
									key={item.id}
									className={cn(
										"flex flex-col gap-2 rounded-xl border p-3",
										itemPreview?.changed
											? "border-primary/50 bg-primary/5"
											: "border-border/60",
									)}
								>
									<div className="flex items-baseline justify-between gap-2">
										<label
											htmlFor={inputId}
											className="text-sm font-semibold text-foreground"
										>
											{item.product_name}
										</label>
										<span className="shrink-0 text-xs text-muted-foreground">
											{formatBRL(item.unit_price)} / {unit}
										</span>
									</div>

									<div className="flex items-center gap-2">
										<input
											id={inputId}
											type="number"
											inputMode="decimal"
											step="0.001"
											min="0"
											className={cn(
												"h-11 w-28 rounded-xl border border-input bg-muted/20 px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
												quantityError && "border-destructive/60",
											)}
											aria-invalid={!!quantityError}
											aria-describedby={`${inputId}-hint`}
											{...register(`items.${index}.quantity`, {
												valueAsNumber: true,
											})}
										/>
										<span className="text-sm text-muted-foreground">
											{unit}
										</span>
									</div>

									<p
										id={`${inputId}-hint`}
										className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
									>
										<span>
											Atual: {item.quantity} {unit} · {formatBRL(item.total)}
										</span>
										{itemPreview?.changed && (
											<>
												<ArrowRight className="size-3" aria-hidden="true" />
												<span className="font-semibold text-foreground">
													Proposto: {formatBRL(itemPreview.proposedTotal)}
												</span>
											</>
										)}
									</p>

									{quantityError && (
										<span
											role="alert"
											className="text-xs font-medium text-destructive"
										>
											{quantityError}
										</span>
									)}
								</div>
							);
						})}
					</fieldset>

					<FormTextarea
						label="Motivo do ajuste"
						required
						rows={3}
						maxLength={ADJUSTMENT_REASON_MAX_LENGTH}
						placeholder="Ex.: Após a pesagem, o tomate deu 1,8 kg em vez de 2 kg."
						disabled={isSubmitting}
						error={errors.reason?.message}
						helperText={`${reason.length}/${ADJUSTMENT_REASON_MAX_LENGTH} caracteres`}
						className="resize-none"
						{...register("reason")}
					/>

					<dl className="flex flex-col gap-1 rounded-xl bg-muted/40 p-3 text-sm">
						<div className="flex justify-between gap-3">
							<dt className="text-muted-foreground">Total atual do pedido</dt>
							<dd className="text-foreground">
								{formatBRL(preview.currentOrderTotal)}
							</dd>
						</div>
						<div className="flex justify-between gap-3">
							<dt className="font-semibold text-foreground">
								Novo total (prévia)
							</dt>
							<dd className="font-bold text-foreground">
								{formatBRL(preview.proposedOrderTotal)}
							</dd>
						</div>
					</dl>

					{apiError && (
						<p
							role="alert"
							className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
						>
							<AlertCircle
								className="mt-0.5 size-4 shrink-0"
								aria-hidden="true"
							/>
							<span>{apiError}</span>
						</p>
					)}

					{!hasChanges && (
						<p className="text-xs text-muted-foreground">
							Altere a quantidade de pelo menos um item para enviar a proposta.
						</p>
					)}

					<DialogFooter className="sm:gap-2">
						<Button
							type="button"
							variant="outline"
							className="h-11"
							disabled={isSubmitting}
							onClick={() => onOpenChange(false)}
						>
							Voltar
						</Button>
						<Button
							type="submit"
							className="h-11"
							disabled={isSubmitting || !hasChanges}
						>
							{isSubmitting ? (
								<Loader2 className="size-4 animate-spin" />
							) : (
								<Send className="size-4" />
							)}
							Enviar ao cliente
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
