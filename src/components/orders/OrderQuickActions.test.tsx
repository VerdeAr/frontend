import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
	OrderQuickActions,
	type OrderQuickActionsProps,
} from "./OrderQuickActions";

function renderizar(props: Partial<OrderQuickActionsProps> = {}) {
	const onChangeStatus = vi.fn().mockResolvedValue(true);
	const utils = render(
		<OrderQuickActions
			status="ABERTA"
			deliveryType="ENTREGA"
			hasPendingAdjustment={false}
			pendingTarget={null}
			onChangeStatus={onChangeStatus}
			{...props}
		/>,
	);
	return { ...utils, onChangeStatus };
}

describe("OrderQuickActions", () => {
	it("oferece iniciar a preparação, concluir direto e cancelar em pedido recebido", async () => {
		const { onChangeStatus } = renderizar();

		await userEvent.click(
			screen.getByRole("button", { name: /Iniciar preparação/ }),
		);

		expect(onChangeStatus).toHaveBeenCalledWith("EM_PREPARACAO");
		expect(
			screen.getByRole("button", { name: /Concluir pedido/ }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: /Cancelar pedido/ }),
		).toBeInTheDocument();
	});

	it("usa o texto da etapa seguinte conforme o tipo de entrega", () => {
		const { unmount } = renderizar({ status: "EM_PREPARACAO" });
		expect(
			screen.getByRole("button", { name: /Saiu para entrega/ }),
		).toBeInTheDocument();
		unmount();

		renderizar({ status: "EM_PREPARACAO", deliveryType: "RETIRADA" });
		expect(
			screen.getByRole("button", { name: /Confirmar retirada/ }),
		).toBeInTheDocument();
	});

	it("bloqueia o avanço e mantém só o cancelamento enquanto o cliente decide", () => {
		renderizar({
			status: "AGUARDANDO_APROVACAO_CLIENTE",
			hasPendingAdjustment: true,
			onProposeAdjustment: vi.fn(),
		});

		expect(
			screen.getByText("Aguardando resposta do cliente."),
		).toBeInTheDocument();
		expect(screen.getAllByRole("button")).toHaveLength(1);
		expect(
			screen.getByRole("button", { name: /Cancelar pedido/ }),
		).toBeInTheDocument();
	});

	it("só mostra 'Propor ajuste' quando o status permite e a página oferece o modal", () => {
		const { unmount } = renderizar({ status: "ABERTA" });
		expect(
			screen.queryByRole("button", { name: /Propor ajuste/ }),
		).not.toBeInTheDocument();
		unmount();

		renderizar({ status: "ABERTA", onProposeAdjustment: vi.fn() });
		expect(
			screen.getByRole("button", { name: /Propor ajuste/ }),
		).toBeInTheDocument();
	});

	it("pede confirmação antes de cancelar", async () => {
		const { onChangeStatus } = renderizar();

		await userEvent.click(
			screen.getByRole("button", { name: /Cancelar pedido/ }),
		);
		expect(onChangeStatus).not.toHaveBeenCalled();

		const dialogo = await screen.findByRole("dialog");
		expect(dialogo).toHaveTextContent("Os produtos voltam para o seu estoque");

		// O último "Cancelar pedido" é o botão de confirmação dentro do diálogo
		const botoes = screen.getAllByRole("button", { name: "Cancelar pedido" });
		await userEvent.click(botoes[botoes.length - 1]);
		expect(onChangeStatus).toHaveBeenCalledWith("CANCELADA");
	});

	it("desabilita as ações durante uma atualização e some em status finais", () => {
		const { unmount } = renderizar({ pendingTarget: "EM_PREPARACAO" });
		for (const botao of screen.getAllByRole("button")) {
			expect(botao).toBeDisabled();
		}
		unmount();

		const { container } = renderizar({ status: "FINALIZADA" });
		expect(container).toBeEmptyDOMElement();
	});
});
