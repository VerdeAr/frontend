import { describe, expect, it } from "vitest";
import type { FormattedSaleItem } from "@/types";
import {
	buildAdjustmentDefaults,
	buildAdjustmentPayload,
	calculateAdjustmentPreview,
	getChangedAdjustmentItems,
} from "./sale-adjustment";

function criarItem(
	id: string,
	quantity: number,
	unitPrice: number,
): FormattedSaleItem {
	return {
		id,
		product_id: `produto-${id}`,
		product_name: `Produto ${id}`,
		product_image: null,
		measurement_unit: "kg",
		quantity,
		unit_price: unitPrice,
		total: Math.round(quantity * unitPrice * 100) / 100,
	};
}

// Tomate: 2 kg × R$ 9,00 = R$ 18,00 | Alface: 3 un × R$ 2,50 = R$ 7,50
const ITENS = [criarItem("tomate", 2, 9), criarItem("alface", 3, 2.5)];

describe("buildAdjustmentDefaults", () => {
	it("começa com motivo vazio e as quantidades atuais", () => {
		expect(buildAdjustmentDefaults(ITENS)).toEqual({
			reason: "",
			items: [
				{ sale_product_id: "tomate", quantity: 2 },
				{ sale_product_id: "alface", quantity: 3 },
			],
		});
	});
});

describe("getChangedAdjustmentItems", () => {
	it("devolve só os itens com quantidade diferente da atual", () => {
		const alterados = getChangedAdjustmentItems(
			[
				{ sale_product_id: "tomate", quantity: 1.85 },
				{ sale_product_id: "alface", quantity: 3 },
			],
			ITENS,
		);
		expect(alterados).toEqual([{ sale_product_id: "tomate", quantity: 1.85 }]);
	});

	it("ignora campos vazios e diferenças abaixo de 3 casas", () => {
		expect(
			getChangedAdjustmentItems(
				[
					{ sale_product_id: "tomate", quantity: Number.NaN },
					{ sale_product_id: "alface", quantity: 3.0001 },
				],
				ITENS,
			),
		).toEqual([]);
	});
});

describe("buildAdjustmentPayload", () => {
	it("envia o motivo sem espaços nas pontas e apenas os itens alterados", () => {
		expect(
			buildAdjustmentPayload(
				{
					reason: "  Peso real após a pesagem  ",
					items: [
						{ sale_product_id: "tomate", quantity: 1.85 },
						{ sale_product_id: "alface", quantity: 3 },
					],
				},
				ITENS,
			),
		).toEqual({
			reason: "Peso real após a pesagem",
			items: [{ sale_product_id: "tomate", quantity: 1.85 }],
		});
	});
});

describe("calculateAdjustmentPreview", () => {
	it("recalcula o item alterado e o total do pedido, mantendo frete e outros itens", () => {
		// Total do pedido: 18 + 7,50 + 5 de frete = 30,50
		const previa = calculateAdjustmentPreview(
			[
				{ sale_product_id: "tomate", quantity: 1.8 },
				{ sale_product_id: "alface", quantity: 3 },
			],
			ITENS,
			30.5,
		);

		expect(previa.items[0]).toEqual({
			saleProductId: "tomate",
			currentTotal: 18,
			proposedTotal: 16.2,
			changed: true,
		});
		expect(previa.items[1].changed).toBe(false);
		expect(previa.proposedOrderTotal).toBe(28.7);
	});

	it("mantém o valor atual enquanto o campo está vazio ou inválido", () => {
		const previa = calculateAdjustmentPreview(
			[{ sale_product_id: "tomate", quantity: Number.NaN }],
			ITENS,
			30.5,
		);
		expect(previa.items[0].proposedTotal).toBe(18);
		expect(previa.proposedOrderTotal).toBe(30.5);
	});
});
