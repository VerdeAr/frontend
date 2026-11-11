import { z } from "zod";

/** Limite de caracteres do motivo do ajuste (igual ao backend). */
export const ADJUSTMENT_REASON_MAX_LENGTH = 500;

// Quantidades são numeric(10,3) no backend: até 3 casas decimais (ex.: 1,850 kg)
const hasAtMostThreeDecimals = (value: number) =>
	Math.abs(Math.round(value * 1000) - value * 1000) < 1e-6;

/**
 * Formulário de proposta de ajuste (RF-56). Espelha o `proposeAdjustmentSchema` do
 * backend só para dar resposta imediata; a validação final continua na API.
 */
export const adjustmentFormSchema = z.object({
	reason: z
		.string()
		.trim()
		.min(1, "Informe o motivo do ajuste.")
		.max(
			ADJUSTMENT_REASON_MAX_LENGTH,
			`O motivo deve ter no máximo ${ADJUSTMENT_REASON_MAX_LENGTH} caracteres.`,
		),
	items: z
		.array(
			z.object({
				sale_product_id: z.string().uuid("Item do pedido inválido."),
				quantity: z
					.number({ error: "Informe a quantidade." })
					.positive("A quantidade deve ser maior que zero.")
					.max(9_999_999.999, "Quantidade muito alta.")
					.refine(hasAtMostThreeDecimals, {
						message: "Use no máximo 3 casas decimais.",
					}),
			}),
		)
		.min(1, "O pedido não tem itens para ajustar."),
});

export type AdjustmentFormData = z.infer<typeof adjustmentFormSchema>;
