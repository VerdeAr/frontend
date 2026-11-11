import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { StatusHistoryEntry } from "@/types";
import { OrderStatusTimeline } from "./OrderStatusTimeline";

const HISTORICO: StatusHistoryEntry[] = [
	{ status: "ABERTA", changed_at: "2026-11-01T10:00:00.000Z" },
	{
		status: "EM_PREPARACAO",
		changed_at: "2026-11-02T10:00:00.000Z",
		changed_by: { id: "vendedor-1", name: "Sítio Boa Vista" },
	},
];

describe("OrderStatusTimeline", () => {
	it("mostra as etapas da Entrega e destaca a atual", () => {
		render(
			<OrderStatusTimeline
				status="EM_PREPARACAO"
				deliveryType="ENTREGA"
				history={HISTORICO}
			/>,
		);

		expect(screen.getAllByRole("listitem").length).toBeGreaterThanOrEqual(4);
		expect(screen.getByText("A caminho")).toBeInTheDocument();

		// A etapa atual é a única marcada com aria-current
		const atual = document.querySelector('[aria-current="step"]');
		expect(atual).toHaveTextContent("Em preparação");
	});

	it("não mostra 'A caminho' na Retirada", () => {
		render(
			<OrderStatusTimeline
				status="ABERTA"
				deliveryType="RETIRADA"
				history={[]}
			/>,
		);

		expect(screen.queryByText("A caminho")).not.toBeInTheDocument();
		expect(
			screen.queryByText(/Ver todas as alterações/),
		).not.toBeInTheDocument();
	});

	it("avisa quando o pedido aguarda a resposta do cliente", () => {
		render(
			<OrderStatusTimeline
				status="AGUARDANDO_APROVACAO_CLIENTE"
				deliveryType="ENTREGA"
				history={[
					...HISTORICO,
					{
						status: "AGUARDANDO_APROVACAO_CLIENTE",
						changed_at: "2026-11-03T10:00:00.000Z",
					},
				]}
			/>,
		);

		expect(
			screen.getByText("Aguardando o cliente responder ao ajuste"),
		).toBeInTheDocument();
	});

	it("mostra o cancelamento e quem fez cada alteração", () => {
		render(
			<OrderStatusTimeline
				status="CANCELADA"
				deliveryType="ENTREGA"
				history={[
					...HISTORICO,
					{ status: "CANCELADA", changed_at: "2026-11-03T10:00:00.000Z" },
				]}
			/>,
		);

		expect(screen.getByText("Pedido cancelado")).toBeInTheDocument();
		expect(screen.getByText(/por Sítio Boa Vista/)).toBeInTheDocument();
	});
});
