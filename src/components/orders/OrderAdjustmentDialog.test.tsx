import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saleService } from "@/services/sale.service";
import type { FormattedSaleItem, SellerOrderDetail } from "@/types";
import { OrderAdjustmentDialog } from "./OrderAdjustmentDialog";

vi.mock("@/services/sale.service", () => ({
	saleService: {
		proposeAdjustment: vi.fn(),
	},
}));

const venda = vi.mocked(saleService);

const ITEM_ID = "3f2b8c1e-4d5a-4b6c-8d7e-9f0a1b2c3d4e";
const ITENS: FormattedSaleItem[] = [
	{
		id: ITEM_ID,
		product_id: "produto-1",
		product_name: "Tomate",
		product_image: null,
		measurement_unit: "kg",
		quantity: 2,
		unit_price: 9,
		total: 18,
	},
];

function normalizar(texto: string | null) {
	return (texto ?? "").replace(/ /g, " ");
}

function renderizar() {
	const onSubmitted = vi.fn();
	const onOpenChange = vi.fn();
	render(
		<OrderAdjustmentDialog
			open
			onOpenChange={onOpenChange}
			orderId="pedido-1"
			items={ITENS}
			orderTotal={30.5}
			onSubmitted={onSubmitted}
		/>,
	);
	return { onSubmitted, onOpenChange };
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("OrderAdjustmentDialog", () => {
	it("só habilita o envio depois que alguma quantidade muda", async () => {
		renderizar();
		const enviar = screen.getByRole("button", { name: /Enviar ao cliente/ });
		expect(enviar).toBeDisabled();

		const campo = screen.getByLabelText("Tomate");
		await userEvent.clear(campo);
		await userEvent.type(campo, "1.8");

		expect(enviar).toBeEnabled();
		expect(normalizar(document.body.textContent)).toContain("R$ 28,70");
	});

	it("valida o motivo antes de chamar a API", async () => {
		renderizar();
		const campo = screen.getByLabelText("Tomate");
		await userEvent.clear(campo);
		await userEvent.type(campo, "1.8");

		await userEvent.click(
			screen.getByRole("button", { name: /Enviar ao cliente/ }),
		);

		expect(
			await screen.findByText("Informe o motivo do ajuste."),
		).toBeInTheDocument();
		expect(venda.proposeAdjustment).not.toHaveBeenCalled();
	});

	it("envia só os itens alterados e fecha ao concluir", async () => {
		const pedidoAtualizado = { id: "pedido-1" } as SellerOrderDetail;
		venda.proposeAdjustment.mockResolvedValue(pedidoAtualizado);
		const { onSubmitted, onOpenChange } = renderizar();

		const campo = screen.getByLabelText("Tomate");
		await userEvent.clear(campo);
		await userEvent.type(campo, "1.8");
		await userEvent.type(
			screen.getByLabelText(/Motivo do ajuste/),
			"Peso real após a pesagem",
		);
		await userEvent.click(
			screen.getByRole("button", { name: /Enviar ao cliente/ }),
		);

		await waitFor(() =>
			expect(venda.proposeAdjustment).toHaveBeenCalledWith("pedido-1", {
				reason: "Peso real após a pesagem",
				items: [{ sale_product_id: ITEM_ID, quantity: 1.8 }],
			}),
		);
		expect(onSubmitted).toHaveBeenCalledWith(pedidoAtualizado);
		expect(onOpenChange).toHaveBeenCalledWith(false);
	});

	it("mostra o erro da API e mantém o que foi digitado", async () => {
		const erro = new AxiosError("Conflito");
		erro.response = {
			status: 409,
			data: { message: "Já existe uma proposta pendente para o pedido" },
		} as AxiosResponse;
		venda.proposeAdjustment.mockRejectedValue(erro);
		const { onOpenChange } = renderizar();

		const campo = screen.getByLabelText("Tomate");
		await userEvent.clear(campo);
		await userEvent.type(campo, "1.8");
		await userEvent.type(screen.getByLabelText(/Motivo do ajuste/), "Pesagem");
		await userEvent.click(
			screen.getByRole("button", { name: /Enviar ao cliente/ }),
		);

		expect(
			await screen.findByText("Já existe uma proposta pendente para o pedido"),
		).toBeInTheDocument();
		expect(campo).toHaveValue(1.8);
		expect(onOpenChange).not.toHaveBeenCalledWith(false);
	});
});
