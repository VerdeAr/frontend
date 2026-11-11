import { describe, expect, it } from "vitest";
import type { SaleStatus, StatusHistoryEntry } from "@/types";
import {
	buildOrderTimeline,
	canProposeAdjustment,
	canSellerTransition,
	getSaleStatusLabel,
	getSaleStatusTone,
	getSellerAdvanceStatus,
	getSellerNextStatuses,
	getTimelineSteps,
	isFinalSaleStatus,
} from "./sale-status";

describe("getSaleStatusLabel", () => {
	it("usa os nomes das etapas do workflow para o vendedor", () => {
		expect(getSaleStatusLabel("ABERTA")).toBe("Recebido");
		expect(getSaleStatusLabel("EM_PREPARACAO")).toBe("Em preparação");
		expect(getSaleStatusLabel("A_CAMINHO")).toBe("A caminho");
		expect(getSaleStatusLabel("FINALIZADA")).toBe("Concluído");
		expect(getSaleStatusLabel("AGUARDANDO_APROVACAO_CLIENTE")).toBe(
			"Aguardando cliente",
		);
	});

	it("troca o texto do ajuste pendente quando quem vê é o cliente", () => {
		expect(getSaleStatusLabel("AGUARDANDO_APROVACAO_CLIENTE", "customer")).toBe(
			"Aguardando sua aprovação",
		);
		expect(getSaleStatusLabel("CANCELADA", "customer")).toBe("Cancelado");
	});
});

describe("getSaleStatusTone", () => {
	it("destaca o ajuste pendente e diferencia sucesso e cancelamento", () => {
		expect(getSaleStatusTone("AGUARDANDO_APROVACAO_CLIENTE")).toBe("attention");
		expect(getSaleStatusTone("FINALIZADA")).toBe("success");
		expect(getSaleStatusTone("CANCELADA")).toBe("danger");
		expect(getSaleStatusTone("A_CAMINHO")).toBe("progress");
	});
});

describe("isFinalSaleStatus", () => {
	it("considera finais apenas Concluído e Cancelado", () => {
		expect(isFinalSaleStatus("FINALIZADA")).toBe(true);
		expect(isFinalSaleStatus("CANCELADA")).toBe(true);
		expect(isFinalSaleStatus("AGUARDANDO_APROVACAO_CLIENTE")).toBe(false);
	});
});

describe("canProposeAdjustment", () => {
	it("permite ajuste só em pedidos Recebidos ou Em preparação", () => {
		expect(canProposeAdjustment("ABERTA")).toBe(true);
		expect(canProposeAdjustment("EM_PREPARACAO")).toBe(true);
		expect(canProposeAdjustment("A_CAMINHO")).toBe(false);
		expect(canProposeAdjustment("AGUARDANDO_APROVACAO_CLIENTE")).toBe(false);
		expect(canProposeAdjustment("FINALIZADA")).toBe(false);
	});
});

describe("canSellerTransition", () => {
	it("só permite 'A caminho' na Entrega", () => {
		expect(canSellerTransition("EM_PREPARACAO", "A_CAMINHO", "ENTREGA")).toBe(
			true,
		);
		expect(canSellerTransition("EM_PREPARACAO", "A_CAMINHO", "RETIRADA")).toBe(
			false,
		);
	});

	it("exige passar por 'A caminho' para concluir uma Entrega em preparação", () => {
		expect(canSellerTransition("EM_PREPARACAO", "FINALIZADA", "ENTREGA")).toBe(
			false,
		);
		expect(canSellerTransition("EM_PREPARACAO", "FINALIZADA", "RETIRADA")).toBe(
			true,
		);
	});

	it("mantém ABERTA → FINALIZADA por compatibilidade", () => {
		expect(canSellerTransition("ABERTA", "FINALIZADA", "ENTREGA")).toBe(true);
	});

	it("não permite cancelar um pedido que já está a caminho", () => {
		expect(canSellerTransition("A_CAMINHO", "CANCELADA", "ENTREGA")).toBe(
			false,
		);
	});
});

describe("getSellerNextStatuses", () => {
	it("só permite cancelar enquanto o cliente decide o ajuste", () => {
		expect(
			getSellerNextStatuses("AGUARDANDO_APROVACAO_CLIENTE", "ENTREGA"),
		).toEqual(["CANCELADA"]);
	});

	it("não oferece ações em status finais", () => {
		expect(getSellerNextStatuses("FINALIZADA", "ENTREGA")).toEqual([]);
		expect(getSellerNextStatuses("CANCELADA", "RETIRADA")).toEqual([]);
	});

	it("lista as opções de um pedido em preparação conforme o tipo de entrega", () => {
		expect(getSellerNextStatuses("EM_PREPARACAO", "ENTREGA")).toEqual([
			"A_CAMINHO",
			"CANCELADA",
		]);
		expect(getSellerNextStatuses("EM_PREPARACAO", "RETIRADA")).toEqual([
			"FINALIZADA",
			"CANCELADA",
		]);
	});
});

describe("getSellerAdvanceStatus", () => {
	it("aponta a próxima etapa do fluxo normal", () => {
		expect(getSellerAdvanceStatus("ABERTA", "ENTREGA")).toBe("EM_PREPARACAO");
		expect(getSellerAdvanceStatus("EM_PREPARACAO", "ENTREGA")).toBe(
			"A_CAMINHO",
		);
		expect(getSellerAdvanceStatus("EM_PREPARACAO", "RETIRADA")).toBe(
			"FINALIZADA",
		);
		expect(getSellerAdvanceStatus("A_CAMINHO", "ENTREGA")).toBe("FINALIZADA");
	});

	it("não considera o cancelamento como avanço", () => {
		expect(
			getSellerAdvanceStatus("AGUARDANDO_APROVACAO_CLIENTE", "ENTREGA"),
		).toBeNull();
		expect(getSellerAdvanceStatus("FINALIZADA", "ENTREGA")).toBeNull();
	});
});

describe("getTimelineSteps", () => {
	it("inclui 'A caminho' apenas na Entrega", () => {
		expect(getTimelineSteps("ENTREGA")).toEqual([
			"ABERTA",
			"EM_PREPARACAO",
			"A_CAMINHO",
			"FINALIZADA",
		]);
		expect(getTimelineSteps("RETIRADA")).toEqual([
			"ABERTA",
			"EM_PREPARACAO",
			"FINALIZADA",
		]);
	});
});

describe("buildOrderTimeline", () => {
	function historico(...status: SaleStatus[]): StatusHistoryEntry[] {
		return status.map((item, index) => ({
			status: item,
			changed_at: `2026-11-0${index + 1}T10:00:00.000Z`,
		}));
	}

	const estados = (status: SaleStatus, ...hist: SaleStatus[]) =>
		buildOrderTimeline(status, "ENTREGA", historico(...hist)).steps.map(
			(step) => step.state,
		);

	it("marca a etapa atual e deixa as seguintes como próximas", () => {
		expect(estados("EM_PREPARACAO", "ABERTA", "EM_PREPARACAO")).toEqual([
			"done",
			"current",
			"upcoming",
			"upcoming",
		]);
	});

	it("traz a data da última entrada de cada etapa", () => {
		const { steps } = buildOrderTimeline(
			"A_CAMINHO",
			"ENTREGA",
			historico("ABERTA", "EM_PREPARACAO", "A_CAMINHO"),
		);
		expect(steps[2].changedAt).toBe("2026-11-03T10:00:00.000Z");
		expect(steps[3].changedAt).toBeNull();
	});

	it("conclui todas as etapas percorridas e marca as puladas", () => {
		expect(estados("FINALIZADA", "ABERTA", "FINALIZADA")).toEqual([
			"done",
			"skipped",
			"skipped",
			"done",
		]);
	});

	it("considera feitas as etapas anteriores em pedidos sem histórico", () => {
		expect(estados("A_CAMINHO")).toEqual([
			"done",
			"done",
			"current",
			"upcoming",
		]);
	});

	it("pausa na última etapa alcançada enquanto o cliente decide o ajuste", () => {
		const timeline = buildOrderTimeline(
			"AGUARDANDO_APROVACAO_CLIENTE",
			"ENTREGA",
			historico("ABERTA", "EM_PREPARACAO", "AGUARDANDO_APROVACAO_CLIENTE"),
		);
		expect(timeline.steps.map((step) => step.state)).toEqual([
			"done",
			"current",
			"upcoming",
			"upcoming",
		]);
		expect(timeline.interruption).toEqual({
			status: "AGUARDANDO_APROVACAO_CLIENTE",
			changedAt: "2026-11-03T10:00:00.000Z",
		});
	});

	it("interrompe o fluxo no cancelamento", () => {
		const timeline = buildOrderTimeline(
			"CANCELADA",
			"RETIRADA",
			historico("ABERTA", "CANCELADA"),
		);
		expect(timeline.steps.map((step) => step.state)).toEqual([
			"done",
			"skipped",
			"skipped",
		]);
		expect(timeline.interruption?.status).toBe("CANCELADA");
	});

	it("não traz interrupção em pedidos dentro do fluxo", () => {
		expect(
			buildOrderTimeline("ABERTA", "ENTREGA", historico("ABERTA")).interruption,
		).toBeNull();
	});
});
