import { describe, expect, it } from "vitest";
import { adjustmentFormSchema } from "./adjustment.schema";

const ITEM_ID = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";

function validar(reason: string, quantity: number) {
	return adjustmentFormSchema.safeParse({
		reason,
		items: [{ sale_product_id: ITEM_ID, quantity }],
	});
}

function primeiraMensagem(resultado: ReturnType<typeof validar>) {
	return resultado.success ? null : resultado.error.issues[0]?.message;
}

describe("adjustmentFormSchema", () => {
	it("aceita motivo preenchido e quantidade com até 3 casas", () => {
		expect(validar("Peso real do tomate: 1,850 kg", 1.85).success).toBe(true);
		expect(validar("Pesagem", 0.125).success).toBe(true);
	});

	it("exige o motivo, ignorando espaços", () => {
		expect(primeiraMensagem(validar("   ", 2))).toBe(
			"Informe o motivo do ajuste.",
		);
	});

	it("limita o motivo a 500 caracteres", () => {
		expect(validar("a".repeat(500), 2).success).toBe(true);
		expect(primeiraMensagem(validar("a".repeat(501), 2))).toBe(
			"O motivo deve ter no máximo 500 caracteres.",
		);
	});

	it("recusa quantidade zero, negativa ou com mais de 3 casas", () => {
		expect(primeiraMensagem(validar("Motivo", 0))).toBe(
			"A quantidade deve ser maior que zero.",
		);
		expect(validar("Motivo", -1).success).toBe(false);
		expect(primeiraMensagem(validar("Motivo", 1.2345))).toBe(
			"Use no máximo 3 casas decimais.",
		);
	});

	it("pede a quantidade quando o campo fica vazio (NaN do valueAsNumber)", () => {
		expect(primeiraMensagem(validar("Motivo", Number.NaN))).toBe(
			"Informe a quantidade.",
		);
	});
});
