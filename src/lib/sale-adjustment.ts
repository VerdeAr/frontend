import type { AdjustmentFormData } from "@/schemas/adjustment.schema";
import type { FormattedSaleItem, ProposeAdjustmentPayload } from "@/types";

/** Arredonda para 3 casas, a precisão das quantidades no backend. */
function roundQuantity(value: number): number {
	return Math.round(value * 1000) / 1000;
}

function roundMoney(value: number): number {
	return Math.round(value * 100) / 100;
}

/** Valores iniciais do formulário: as quantidades atuais de cada item do vendedor. */
export function buildAdjustmentDefaults(
	items: readonly FormattedSaleItem[],
): AdjustmentFormData {
	return {
		reason: "",
		items: items.map((item) => ({
			sale_product_id: item.id,
			quantity: item.quantity,
		})),
	};
}

/** Itens cuja quantidade foi alterada (o backend recusa quantidade igual à atual). */
export function getChangedAdjustmentItems(
	formItems: AdjustmentFormData["items"],
	originalItems: readonly FormattedSaleItem[],
): AdjustmentFormData["items"] {
	return formItems.filter((formItem) => {
		const original = originalItems.find(
			(item) => item.id === formItem.sale_product_id,
		);
		return (
			original !== undefined &&
			Number.isFinite(formItem.quantity) &&
			roundQuantity(formItem.quantity) !== roundQuantity(original.quantity)
		);
	});
}

/** Corpo do POST de proposta, apenas com o motivo e os itens alterados. */
export function buildAdjustmentPayload(
	form: AdjustmentFormData,
	originalItems: readonly FormattedSaleItem[],
): ProposeAdjustmentPayload {
	return {
		reason: form.reason.trim(),
		items: getChangedAdjustmentItems(form.items, originalItems).map((item) => ({
			sale_product_id: item.sale_product_id,
			quantity: roundQuantity(item.quantity),
		})),
	};
}

export interface AdjustmentPreviewItem {
	saleProductId: string;
	currentTotal: number;
	proposedTotal: number;
	changed: boolean;
}

export interface AdjustmentPreview {
	items: AdjustmentPreviewItem[];
	currentOrderTotal: number;
	proposedOrderTotal: number;
}

/**
 * Prévia dos novos valores enquanto o vendedor digita. O preço unitário não muda;
 * o total oficial é recalculado pelo backend quando o cliente aceita.
 * Quantidade vazia ou inválida mantém o valor atual do item na prévia.
 */
export function calculateAdjustmentPreview(
	formItems: AdjustmentFormData["items"],
	originalItems: readonly FormattedSaleItem[],
	currentOrderTotal: number,
): AdjustmentPreview {
	let difference = 0;

	const items = originalItems.map((original): AdjustmentPreviewItem => {
		const formItem = formItems.find(
			(item) => item.sale_product_id === original.id,
		);
		const quantity =
			formItem && Number.isFinite(formItem.quantity) && formItem.quantity > 0
				? formItem.quantity
				: original.quantity;
		const proposedTotal = roundMoney(quantity * original.unit_price);
		difference += proposedTotal - original.total;

		return {
			saleProductId: original.id,
			currentTotal: original.total,
			proposedTotal,
			changed: roundQuantity(quantity) !== roundQuantity(original.quantity),
		};
	});

	return {
		items,
		currentOrderTotal,
		proposedOrderTotal: roundMoney(currentOrderTotal + difference),
	};
}
