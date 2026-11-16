import { AxiosError, type AxiosResponse } from "axios";
import { UNSAFE_ErrorResponseImpl as ErrorResponseImpl } from "react-router";
import { describe, expect, it } from "vitest";
import { getRouteErrorContent } from "./route-error";

// Objeto que o roteador entrega ao errorElement quando um loader lança data(..., { status })
function erroDeRota(status: number) {
	return new ErrorResponseImpl(status, "Texto técnico", null);
}

function erroAxios(status: number): AxiosError {
	const erro = new AxiosError("Request failed with status code 500");
	erro.response = { status, data: {} } as AxiosResponse;
	return erro;
}

describe("getRouteErrorContent", () => {
	it.each([
		[404, "not-found", "Página não encontrada"],
		[401, "unauthorized", "Sua sessão expirou"],
		[403, "forbidden", "Acesso não permitido"],
		[500, "server", "Serviço indisponível"],
		[503, "server", "Serviço indisponível"],
	])("classifica a resposta de rota %i como %s", (status, tipo, titulo) => {
		const conteudo = getRouteErrorContent(erroDeRota(status));

		expect(conteudo.kind).toBe(tipo);
		expect(conteudo.status).toBe(status);
		expect(conteudo.title).toBe(titulo);
	});

	it("trata outros códigos 4xx como erro genérico", () => {
		const conteudo = getRouteErrorContent(erroDeRota(400));

		expect(conteudo.kind).toBe("unknown");
		expect(conteudo.status).toBe(400);
	});

	it("usa o código HTTP de um erro do Axios lançado pelo loader", () => {
		expect(getRouteErrorContent(erroAxios(403)).kind).toBe("forbidden");
		expect(getRouteErrorContent(erroAxios(502)).kind).toBe("server");
	});

	it("trata Error e valores desconhecidos como erro genérico sem código", () => {
		for (const erro of [new Error("x is undefined"), "falhou", null]) {
			const conteudo = getRouteErrorContent(erro);
			expect(conteudo.kind).toBe("unknown");
			expect(conteudo.status).toBeNull();
		}
	});

	it("nunca expõe o texto técnico do erro original", () => {
		const casos = [
			erroDeRota(500),
			erroAxios(500),
			new Error("Cannot read properties of undefined"),
		];

		for (const erro of casos) {
			const { title, message } = getRouteErrorContent(erro);
			expect(`${title} ${message}`).not.toMatch(
				/Texto técnico|Request failed|Cannot read/,
			);
		}
	});
});
