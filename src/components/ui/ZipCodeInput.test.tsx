import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { cepService } from "@/services";
import { ZipCodeInput } from "./ZipCodeInput";

vi.mock("@/services", () => ({
	cepService: {
		getAddressByCep: vi.fn(),
	},
}));

describe("ZipCodeInput", () => {
	it("chama onAddressFound e limpa erros quando o CEP é encontrado", async () => {
		const handleAddressFound = vi.fn();
		const handleErrorChange = vi.fn();

		vi.mocked(cepService.getAddressByCep).mockResolvedValueOnce({
			cep: "01001-000",
			logradouro: "Praça da Sé",
			complemento: "",
			bairro: "Sé",
			localidade: "São Paulo",
			uf: "SP",
		});

		render(
			<ZipCodeInput
				onAddressFound={handleAddressFound}
				onErrorChange={handleErrorChange}
			/>,
		);

		const input = screen.getByRole("textbox", { name: /cep/i });
		await userEvent.type(input, "01001000");

		await waitFor(() => {
			expect(handleAddressFound).toHaveBeenCalledWith(
				expect.objectContaining({
					cep: "01001-000",
					logradouro: "Praça da Sé",
				}),
			);
		});

		expect(screen.queryByText("CEP não encontrado")).not.toBeInTheDocument();
	});

	it("exibe 'CEP não encontrado' quando o serviço retorna null", async () => {
		vi.mocked(cepService.getAddressByCep).mockResolvedValueOnce(null);

		render(<ZipCodeInput />);

		const input = screen.getByRole("textbox", { name: /cep/i });
		await userEvent.type(input, "99999999");

		await waitFor(() => {
			expect(screen.getByText("CEP não encontrado")).toBeInTheDocument();
		});
	});

	it("exibe mensagem amigável de falha de rede quando a consulta falha", async () => {
		vi.mocked(cepService.getAddressByCep).mockRejectedValueOnce(
			new Error("Network Error"),
		);

		render(<ZipCodeInput />);

		const input = screen.getByRole("textbox", { name: /cep/i });
		await userEvent.type(input, "01001000");

		await waitFor(() => {
			expect(
				screen.getByText(
					"Não foi possível consultar o CEP agora. Preencha o endereço manualmente.",
				),
			).toBeInTheDocument();
		});
	});
});
