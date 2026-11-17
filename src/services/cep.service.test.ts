import axios from "axios";
import { describe, expect, it, vi } from "vitest";
import { cepService } from "./cep.service";

vi.mock("axios");

describe("cepService", () => {
	it("retorna null se o CEP não contiver 8 dígitos", async () => {
		const result = await cepService.getAddressByCep("123");
		expect(result).toBeNull();
		expect(axios.get).not.toHaveBeenCalled();
	});

	it("retorna dados estruturados quando o CEP é encontrado", async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({
			data: {
				cep: "01001-000",
				logradouro: "Praça da Sé",
				complemento: "lado ímpar",
				bairro: "Sé",
				localidade: "São Paulo",
				uf: "SP",
			},
		});

		const result = await cepService.getAddressByCep("01001-000");
		expect(result).toEqual({
			cep: "01001-000",
			logradouro: "Praça da Sé",
			complemento: "lado ímpar",
			bairro: "Sé",
			localidade: "São Paulo",
			uf: "SP",
			ibge: undefined,
			gia: undefined,
			ddd: undefined,
			siafi: undefined,
		});
	});

	it("retorna null quando o ViaCEP responde com erro: true", async () => {
		vi.mocked(axios.get).mockResolvedValueOnce({
			data: {
				erro: true,
			},
		});

		const result = await cepService.getAddressByCep("99999-999");
		expect(result).toBeNull();
	});

	it("lança erro quando ocorre falha de rede ou timeout no axios", async () => {
		vi.mocked(axios.get).mockRejectedValueOnce(new Error("Network Error"));

		await expect(cepService.getAddressByCep("01001-000")).rejects.toThrow(
			"Network Error",
		);
	});
});
