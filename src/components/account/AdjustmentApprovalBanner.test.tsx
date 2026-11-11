import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError, type AxiosResponse } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { saleService } from "@/services/sale.service";
import type { SaleAdjustment, SaleResponse } from "@/types";
import { AdjustmentApprovalBanner } from "./AdjustmentApprovalBanner";

vi.mock("@/services/sale.service", () => ({
	saleService: {
		respondAdjustment: vi.fn(),
	},
}));

const venda = vi.mocked(saleService);

const AJUSTE: SaleAdjustment = {
	id: "ajuste-1",
	reason: "Peso real do tomate: 1,8 kg",
	status: "PENDENTE",
	previous_status: "EM_PREPARACAO",
	items: [
		{
			id: "item-ajuste-1",
			sale_product_id: "item-1",
			product_id: "produto-1",
			product_name: "Tomate",
			original_quantity: 2,
			proposed_quantity: 1.8,
			original_unit_price: 9,
			proposed_unit_price: 9,
			original_total: 18,
			proposed_total: 16.2,
		},
	],
	current_order_total: 30.5,
	proposed_order_total: 28.7,
};

const COMPRA_ATUALIZADA: SaleResponse = {
	id: "venda-1",
	customer_id: "cliente-1",
	delivery_type: "ENTREGA",
	status: "EM_PREPARACAO",
	total_amount: 28.7,
	created_at: "2026-11-01T10:00:00.000Z",
	updated_at: "2026-11-02T10:00:00.000Z",
	items: [],
	payments: [],
	pending_adjustment: null,
};

function normalizar(texto: string | null) {
	return (texto ?? "").replace(/ /g, " ");
}

function renderizar() {
	const onResponded = vi.fn();
	render(
		<AdjustmentApprovalBanner
			saleId="venda-1"
			adjustment={AJUSTE}
			onResponded={onResponded}
		/>,
	);
	return { onResponded };
}

beforeEach(() => {
	vi.clearAllMocks();
	vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("AdjustmentApprovalBanner", () => {
	it("mostra o motivo e os valores antigos e novos", () => {
		renderizar();

		expect(screen.getByText(/Peso real do tomate/)).toBeInTheDocument();
		const texto = normalizar(document.body.textContent);
		expect(texto).toContain("R$ 18,00");
		expect(texto).toContain("R$ 16,20");
		expect(texto).toContain("R$ 30,50");
		expect(texto).toContain("R$ 28,70");
	});

	it("aceita o ajuste uma única vez, mesmo com duplo clique", async () => {
		venda.respondAdjustment.mockResolvedValue(COMPRA_ATUALIZADA);
		const { onResponded } = renderizar();

		const aceitar = screen.getByRole("button", { name: /Aceitar Ajuste/ });
		await userEvent.dblClick(aceitar);

		await waitFor(() =>
			expect(onResponded).toHaveBeenCalledWith(COMPRA_ATUALIZADA, true),
		);
		expect(venda.respondAdjustment).toHaveBeenCalledTimes(1);
		expect(venda.respondAdjustment).toHaveBeenCalledWith("venda-1", true);
	});

	it("pede confirmação antes de recusar e cancelar o pedido", async () => {
		const cancelada = { ...COMPRA_ATUALIZADA, status: "CANCELADA" as const };
		venda.respondAdjustment.mockResolvedValue(cancelada);
		const { onResponded } = renderizar();

		await userEvent.click(
			screen.getByRole("button", { name: /Cancelar Pedido/ }),
		);
		expect(venda.respondAdjustment).not.toHaveBeenCalled();

		const dialogo = await screen.findByRole("dialog");
		expect(dialogo).toHaveTextContent("o pedido inteiro é cancelado");

		await userEvent.click(
			screen.getByRole("button", { name: "Cancelar pedido" }),
		);

		await waitFor(() =>
			expect(onResponded).toHaveBeenCalledWith(cancelada, false),
		);
		expect(venda.respondAdjustment).toHaveBeenCalledWith("venda-1", false);
	});

	it("mostra a mensagem da API quando a proposta já foi respondida", async () => {
		const erro = new AxiosError("Conflito");
		erro.response = {
			status: 409,
			data: { message: "Não há proposta de ajuste pendente para esta compra" },
		} as AxiosResponse;
		venda.respondAdjustment.mockRejectedValue(erro);
		const { onResponded } = renderizar();

		await userEvent.click(
			screen.getByRole("button", { name: /Aceitar Ajuste/ }),
		);

		expect(
			await screen.findByText(
				"Não há proposta de ajuste pendente para esta compra",
			),
		).toBeInTheDocument();
		expect(onResponded).not.toHaveBeenCalled();
		expect(
			screen.getByRole("button", { name: /Aceitar Ajuste/ }),
		).toBeEnabled();
	});
});
