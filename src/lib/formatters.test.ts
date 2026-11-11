import { describe, expect, it } from "vitest";
import { formatBRL, formatDate, formatStock } from "./formatters";

// O Intl usa espaço sem quebra entre "R$" e o valor; normaliza para comparar com espaço comum
const semEspacoEspecial = (texto: string) => texto.replace(/ /g, " ");

describe("formatBRL", () => {
	it("formata números em reais com separadores brasileiros", () => {
		expect(semEspacoEspecial(formatBRL(1234.5))).toBe("R$ 1.234,50");
		expect(semEspacoEspecial(formatBRL(0))).toBe("R$ 0,00");
	});

	it("aceita valores numéricos em texto, como vêm das entidades da API", () => {
		expect(semEspacoEspecial(formatBRL("8.50"))).toBe("R$ 8,50");
	});

	it("trata valores ausentes ou inválidos como zero", () => {
		expect(semEspacoEspecial(formatBRL(null))).toBe("R$ 0,00");
		expect(semEspacoEspecial(formatBRL(undefined))).toBe("R$ 0,00");
		expect(semEspacoEspecial(formatBRL("abc"))).toBe("R$ 0,00");
	});
});

describe("formatStock", () => {
	it("mostra números inteiros sem casas decimais", () => {
		expect(formatStock(10)).toBe("10");
		expect(formatStock("7.000")).toBe("7");
	});

	it("mostra duas casas e vírgula para quantidades fracionadas", () => {
		expect(formatStock(0.5)).toBe("0,50");
		expect(formatStock("2.25")).toBe("2,25");
	});

	it("acrescenta o símbolo da unidade quando informado", () => {
		expect(formatStock(3, "kg")).toBe("3 kg");
		expect(formatStock(1.5, "L")).toBe("1,50 L");
	});

	it("ignora a unidade vazia ou nula", () => {
		expect(formatStock(3, null)).toBe("3");
		expect(formatStock(3, "")).toBe("3");
	});

	it("trata estoque ausente como zero", () => {
		expect(formatStock(null)).toBe("0");
		expect(formatStock(undefined, "un")).toBe("0 un");
	});
});

describe("formatDate", () => {
	it("retorna texto vazio quando não há data", () => {
		expect(formatDate(null)).toBe("");
		expect(formatDate(undefined)).toBe("");
		expect(formatDate("")).toBe("");
	});

	it("formata um objeto Date no padrão brasileiro, com hora", () => {
		const data = new Date(2026, 9, 27, 14, 30);

		expect(formatDate(data)).toMatch(/^27\/10\/2026,? 14:30$/);
	});

	it("formata uma data em texto (ISO)", () => {
		const iso = new Date(2026, 0, 5, 9, 5).toISOString();

		expect(formatDate(iso)).toMatch(/^05\/01\/2026,? 09:05$/);
	});
});
