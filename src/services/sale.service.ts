import { api } from "@/lib/api";
import type {
	CheckoutPayload,
	ProposeAdjustmentPayload,
	SaleResponse,
	SellerOrderDetail,
	SellerOrderResponse,
	SellerTargetStatus,
} from "@/types";

export const saleService = {
	/**
	 * Realiza o checkout transacional do carrinho de compras.
	 */
	async checkout(data?: CheckoutPayload): Promise<SaleResponse> {
		const response = await api.post<SaleResponse>("/vendas/checkout", data);
		return response.data;
	},

	/**
	 * Lista o histórico de compras do cliente autenticado.
	 */
	async getMyPurchases(): Promise<SaleResponse[]> {
		const response = await api.get<SaleResponse[]>("/vendas/minhas-compras");
		return response.data;
	},

	/**
	 * Obtém os detalhes de um pedido específico do cliente.
	 */
	async getPurchaseById(id: string): Promise<SaleResponse> {
		const response = await api.get<SaleResponse>(`/vendas/${id}`);
		return response.data;
	},

	/**
	 * Lista os pedidos recebidos pelo vendedor autenticado.
	 */
	async getSellerOrders(status?: string): Promise<SellerOrderResponse[]> {
		const response = await api.get<SellerOrderResponse[]>("/vendedor/pedidos", {
			params: status ? { status } : undefined,
		});
		return response.data;
	},

	/**
	 * Obtém a contagem de pedidos pendentes do vendedor para notificações.
	 */
	async getPendingOrdersCount(): Promise<{ count: number }> {
		const response = await api.get<{ count: number }>(
			"/vendedor/pedidos/pendentes/count",
		);
		return response.data;
	},

	/**
	 * Atualiza o status do pedido pelo vendedor, conforme a máquina de estados do backend.
	 */
	async updateOrderStatus(
		id: string,
		status: SellerTargetStatus,
	): Promise<SellerOrderResponse> {
		const response = await api.patch<SellerOrderResponse>(
			`/vendas/${id}/status`,
			{ status },
		);
		return response.data;
	},

	/**
	 * Obtém o detalhe de um pedido do vendedor, com histórico de status e ajuste pendente.
	 */
	async getSellerOrderDetail(id: string): Promise<SellerOrderDetail> {
		const response = await api.get<SellerOrderDetail>(
			`/vendedor/pedidos/${id}`,
		);
		return response.data;
	},

	/**
	 * Envia ao cliente uma proposta de ajuste de quantidade ou pesagem (RF-56).
	 * O pedido passa a AGUARDANDO_APROVACAO_CLIENTE até a resposta do cliente.
	 */
	async proposeAdjustment(
		id: string,
		data: ProposeAdjustmentPayload,
	): Promise<SellerOrderDetail> {
		const response = await api.post<SellerOrderDetail>(
			`/vendedor/pedidos/${id}/propor-ajuste`,
			data,
		);
		return response.data;
	},

	/**
	 * Registra a resposta do cliente à proposta de ajuste.
	 * Aceitar aplica os novos valores; recusar cancela o pedido inteiro.
	 */
	async respondAdjustment(id: string, accept: boolean): Promise<SaleResponse> {
		const response = await api.post<SaleResponse>(
			`/vendas/${id}/responder-ajuste`,
			{ aceitar: accept },
		);
		return response.data;
	},
};
