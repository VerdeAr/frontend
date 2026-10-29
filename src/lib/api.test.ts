import type { AxiosAdapter, InternalAxiosRequestConfig } from "axios";
import { AxiosError } from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { api, setOnUnauthorizedCallback } from "./api";

// Troca o envio HTTP real por um adaptador que devolve o status desejado
function responderCom(status: number): AxiosAdapter {
	return async (config: InternalAxiosRequestConfig) => {
		const resposta = {
			data: {},
			status,
			statusText: "",
			headers: {},
			config,
		};
		if (status >= 400) {
			throw new AxiosError(
				`Erro ${status}`,
				AxiosError.ERR_BAD_RESPONSE,
				config,
				null,
				resposta,
			);
		}
		return resposta;
	};
}

const adaptadorOriginal = api.defaults.adapter;

afterEach(() => {
	api.defaults.adapter = adaptadorOriginal;
	setOnUnauthorizedCallback(() => {});
});

describe("cliente HTTP (api)", () => {
	it("envia os cookies da sessão e não usa cabeçalho Authorization", async () => {
		let configEnviada: InternalAxiosRequestConfig | undefined;
		api.defaults.adapter = async (config) => {
			configEnviada = config;
			return { data: {}, status: 200, statusText: "", headers: {}, config };
		};

		await api.get("/auth/me");

		expect(api.defaults.withCredentials).toBe(true);
		expect(configEnviada?.withCredentials).toBe(true);
		expect(configEnviada?.headers.has("Authorization")).toBe(false);
	});

	it("aciona o callback de logout quando a API responde 401", async () => {
		const aoDeslogar = vi.fn();
		setOnUnauthorizedCallback(aoDeslogar);
		api.defaults.adapter = responderCom(401);

		await expect(api.get("/carrinho")).rejects.toBeInstanceOf(AxiosError);

		expect(aoDeslogar).toHaveBeenCalledTimes(1);
	});

	it("não aciona o callback para outros erros", async () => {
		const aoDeslogar = vi.fn();
		setOnUnauthorizedCallback(aoDeslogar);

		api.defaults.adapter = responderCom(403);
		await expect(api.get("/vendedor/produtos")).rejects.toBeInstanceOf(
			AxiosError,
		);

		api.defaults.adapter = responderCom(500);
		await expect(api.get("/produtos")).rejects.toBeInstanceOf(AxiosError);

		expect(aoDeslogar).not.toHaveBeenCalled();
	});

	it("repassa o erro mesmo sem callback registrado", async () => {
		api.defaults.adapter = responderCom(401);

		await expect(api.get("/carrinho")).rejects.toBeInstanceOf(AxiosError);
	});
});
