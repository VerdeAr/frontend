import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { getApiErrorMessage, getApiErrorStatus } from "./api-error";

function criarErroAxios(status: number, data: unknown): AxiosError {
	const erro = new AxiosError("Falha na requisição");
	erro.response = { status, data } as AxiosResponse;
	return erro;
}

describe("getApiErrorStatus", () => {
	it("devolve o código HTTP da resposta", () => {
		expect(getApiErrorStatus(criarErroAxios(403, {}))).toBe(403);
	});

	it("devolve null quando não houve resposta ou o erro não é do Axios", () => {
		expect(getApiErrorStatus(new AxiosError("Network Error"))).toBeNull();
		expect(getApiErrorStatus(new Error("qualquer"))).toBeNull();
	});
});

describe("getApiErrorMessage", () => {
	const PADRAO = "Algo deu errado.";

	it("usa a mensagem da API", () => {
		const erro = criarErroAxios(409, {
			success: false,
			message: "Já existe uma proposta pendente para o pedido",
		});
		expect(getApiErrorMessage(erro, PADRAO)).toBe(
			"Já existe uma proposta pendente para o pedido",
		);
	});

	it("prioriza a primeira mensagem de campo em erros de validação", () => {
		const erro = criarErroAxios(400, {
			message: "Dados inválidos",
			errors: [{ field: "reason", message: "Motivo do ajuste é obrigatório" }],
		});
		expect(getApiErrorMessage(erro, PADRAO)).toBe(
			"Motivo do ajuste é obrigatório",
		);
	});

	it("usa o texto padrão quando a API não manda mensagem", () => {
		expect(getApiErrorMessage(criarErroAxios(500, {}), PADRAO)).toBe(PADRAO);
		expect(getApiErrorMessage(new Error("interno"), PADRAO)).toBe(PADRAO);
	});
});
