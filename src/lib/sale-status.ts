import type {
	DeliveryType,
	SaleStatus,
	SellerTargetStatus,
	StatusHistoryEntry,
} from "@/types";

/**
 * Regras de exibição do status do pedido (RF-52, RF-55 e RF-56).
 *
 * As transições espelham a máquina de estados do backend (`services/sale-status.ts`),
 * que é a autoridade final; aqui elas servem apenas para decidir quais botões mostrar.
 */

/** Quem está vendo o pedido: muda apenas o texto de alguns status. */
export type SaleStatusAudience = "seller" | "customer";

/** Tom visual do selo de status. */
export type SaleStatusTone =
	| "pending"
	| "progress"
	| "attention"
	| "success"
	| "danger";

const SALE_STATUS_LABELS: Record<SaleStatus, string> = {
	ABERTA: "Recebido",
	EM_PREPARACAO: "Em preparação",
	A_CAMINHO: "A caminho",
	AGUARDANDO_APROVACAO_CLIENTE: "Aguardando cliente",
	FINALIZADA: "Concluído",
	CANCELADA: "Cancelado",
};

// Textos que mudam quando o cliente vê a própria compra
const CUSTOMER_LABEL_OVERRIDES: Partial<Record<SaleStatus, string>> = {
	AGUARDANDO_APROVACAO_CLIENTE: "Aguardando sua aprovação",
};

const SALE_STATUS_TONES: Record<SaleStatus, SaleStatusTone> = {
	ABERTA: "pending",
	EM_PREPARACAO: "progress",
	A_CAMINHO: "progress",
	AGUARDANDO_APROVACAO_CLIENTE: "attention",
	FINALIZADA: "success",
	CANCELADA: "danger",
};

// Transições permitidas ao vendedor, na ordem em que os botões devem aparecer
const SELLER_TRANSITIONS: Record<SaleStatus, readonly SellerTargetStatus[]> = {
	ABERTA: ["EM_PREPARACAO", "FINALIZADA", "CANCELADA"],
	EM_PREPARACAO: ["A_CAMINHO", "FINALIZADA", "CANCELADA"],
	A_CAMINHO: ["FINALIZADA"],
	AGUARDANDO_APROVACAO_CLIENTE: ["CANCELADA"],
	FINALIZADA: [],
	CANCELADA: [],
};

const ADJUSTABLE_STATUSES: readonly SaleStatus[] = ["ABERTA", "EM_PREPARACAO"];

const FINAL_STATUSES: readonly SaleStatus[] = ["FINALIZADA", "CANCELADA"];

export function getSaleStatusLabel(
	status: SaleStatus,
	audience: SaleStatusAudience = "seller",
): string {
	if (audience === "customer") {
		return CUSTOMER_LABEL_OVERRIDES[status] ?? SALE_STATUS_LABELS[status];
	}
	return SALE_STATUS_LABELS[status];
}

export function getSaleStatusTone(status: SaleStatus): SaleStatusTone {
	return SALE_STATUS_TONES[status];
}

export function isFinalSaleStatus(status: SaleStatus): boolean {
	return FINAL_STATUSES.includes(status);
}

/** O vendedor só propõe ajuste em pedidos Recebidos ou Em Preparação. */
export function canProposeAdjustment(status: SaleStatus): boolean {
	return ADJUSTABLE_STATUSES.includes(status);
}

/**
 * Indica se o vendedor pode levar o pedido de `from` para `to`.
 * - "A caminho" só existe na Entrega.
 * - Na Entrega, um pedido em preparação passa por "A caminho" antes de concluir.
 */
export function canSellerTransition(
	from: SaleStatus,
	to: SellerTargetStatus,
	deliveryType: DeliveryType,
): boolean {
	if (!SELLER_TRANSITIONS[from].includes(to)) {
		return false;
	}

	if (to === "A_CAMINHO") {
		return deliveryType === "ENTREGA";
	}

	if (from === "EM_PREPARACAO" && to === "FINALIZADA") {
		return deliveryType === "RETIRADA";
	}

	return true;
}

/** Status para os quais o vendedor pode mover o pedido agora, em ordem de exibição. */
export function getSellerNextStatuses(
	status: SaleStatus,
	deliveryType: DeliveryType,
): SellerTargetStatus[] {
	return SELLER_TRANSITIONS[status].filter((target) =>
		canSellerTransition(status, target, deliveryType),
	);
}

/**
 * Próxima etapa do fluxo normal (botão principal "Avançar"), ou null se não houver.
 * Cancelar nunca é considerado avanço.
 */
export function getSellerAdvanceStatus(
	status: SaleStatus,
	deliveryType: DeliveryType,
): SellerTargetStatus | null {
	const [first] = getSellerNextStatuses(status, deliveryType).filter(
		(target) => target !== "CANCELADA",
	);
	return first ?? null;
}

/** Etapas exibidas na linha do tempo; a Retirada não tem "A caminho". */
export function getTimelineSteps(deliveryType: DeliveryType): SaleStatus[] {
	return deliveryType === "ENTREGA"
		? ["ABERTA", "EM_PREPARACAO", "A_CAMINHO", "FINALIZADA"]
		: ["ABERTA", "EM_PREPARACAO", "FINALIZADA"];
}

/** Situação de cada etapa na linha do tempo. */
export type TimelineStepState = "done" | "current" | "upcoming" | "skipped";

export interface TimelineStep {
	status: SaleStatus;
	state: TimelineStepState;
	/** Data da última vez em que o pedido entrou nesta etapa, se houver registro. */
	changedAt: string | null;
}

export interface OrderTimeline {
	steps: TimelineStep[];
	/** Status fora do fluxo normal (cancelado ou aguardando o cliente), quando for o atual. */
	interruption: { status: SaleStatus; changedAt: string | null } | null;
}

function lastChangeOf(
	history: readonly StatusHistoryEntry[],
	status: SaleStatus,
): string | null {
	const entries = history.filter((entry) => entry.status === status);
	return entries.length > 0 ? entries[entries.length - 1].changed_at : null;
}

/**
 * Monta a linha do tempo do pedido a partir do histórico de status.
 * - A etapa alcançada é o status atual ou, se o pedido saiu do fluxo (cancelado ou
 *   aguardando o cliente), a última etapa registrada no histórico.
 * - Pedidos antigos podem não ter histórico; nesse caso as etapas anteriores contam como feitas.
 * - Etapas puladas (ex.: Recebido → Concluído) aparecem como "skipped".
 */
export function buildOrderTimeline(
	status: SaleStatus,
	deliveryType: DeliveryType,
	history: readonly StatusHistoryEntry[],
): OrderTimeline {
	const stepStatuses = getTimelineSteps(deliveryType);
	const isInterrupted = !stepStatuses.includes(status);

	let reachedIndex = stepStatuses.indexOf(status);
	if (isInterrupted) {
		const reachedSteps = stepStatuses
			.map((step, index) => (lastChangeOf(history, step) ? index : -1))
			.filter((index) => index >= 0);
		// Todo pedido começa em Recebido, mesmo sem registro
		reachedIndex = reachedSteps.length > 0 ? Math.max(...reachedSteps) : 0;
	}

	const hasHistory = history.length > 0;

	const steps = stepStatuses.map((step, index): TimelineStep => {
		const changedAt = lastChangeOf(history, step);

		let state: TimelineStepState;
		if (index > reachedIndex) {
			state = status === "CANCELADA" ? "skipped" : "upcoming";
		} else if (index === reachedIndex) {
			state =
				status === "FINALIZADA" || status === "CANCELADA" ? "done" : "current";
		} else {
			state = changedAt || !hasHistory ? "done" : "skipped";
		}

		return { status: step, state, changedAt };
	});

	return {
		steps,
		interruption: isInterrupted
			? { status, changedAt: lastChangeOf(history, status) }
			: null,
	};
}
