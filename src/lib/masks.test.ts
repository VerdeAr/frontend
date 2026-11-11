import { describe, expect, it } from "vitest";
import { maskCnpj, maskCpf, maskPhone, unmask } from "./masks";

describe("maskCpf", () => {
	it("aplica a máscara em um CPF completo", () => {
		expect(maskCpf("12345678901")).toBe("123.456.789-01");
	});

	it("aplica a máscara aos poucos, enquanto o usuário digita", () => {
		expect(maskCpf("123")).toBe("123");
		expect(maskCpf("1234")).toBe("123.4");
		expect(maskCpf("1234567")).toBe("123.456.7");
		expect(maskCpf("1234567890")).toBe("123.456.789-0");
	});

	it("remove caracteres que não são dígitos", () => {
		expect(maskCpf("123.456.789-01")).toBe("123.456.789-01");
		expect(maskCpf("abc123def")).toBe("123");
	});

	it("descarta dígitos além dos 11 do CPF", () => {
		expect(maskCpf("1234567890123")).toBe("123.456.789-01");
	});

	it("devolve texto vazio para entrada vazia", () => {
		expect(maskCpf("")).toBe("");
	});
});

describe("maskCnpj", () => {
	it("aplica a máscara em um CNPJ completo", () => {
		expect(maskCnpj("12345678000195")).toBe("12.345.678/0001-95");
	});

	it("aplica a máscara aos poucos", () => {
		expect(maskCnpj("12")).toBe("12");
		expect(maskCnpj("123")).toBe("12.3");
		expect(maskCnpj("12345678")).toBe("12.345.678");
		expect(maskCnpj("123456780001")).toBe("12.345.678/0001");
	});

	it("descarta dígitos além dos 14 do CNPJ e caracteres não numéricos", () => {
		expect(maskCnpj("12.345.678/0001-95999")).toBe("12.345.678/0001-95");
	});
});

describe("maskPhone", () => {
	it("formata celular com 11 dígitos", () => {
		expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
	});

	it("formata telefone fixo com 10 dígitos", () => {
		expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
	});

	it("formata números parciais", () => {
		expect(maskPhone("11")).toBe("11");
		expect(maskPhone("119")).toBe("(11) 9");
		expect(maskPhone("1198765")).toBe("(11) 9876-5");
	});

	it("remove a formatação anterior e limita a 11 dígitos", () => {
		expect(maskPhone("(11) 98765-4321")).toBe("(11) 98765-4321");
		expect(maskPhone("119876543210000")).toBe("(11) 98765-4321");
	});
});

describe("unmask", () => {
	it("mantém somente os dígitos", () => {
		expect(unmask("123.456.789-01")).toBe("12345678901");
		expect(unmask("(11) 98765-4321")).toBe("11987654321");
		expect(unmask("sem números")).toBe("");
	});
});
