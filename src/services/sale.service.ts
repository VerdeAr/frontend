import { api } from "@/lib/api";
import type {
	CheckoutPayload,
	SaleResponse,
	SellerOrderResponse,
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
	 * Atualiza o status do pedido pelo vendedor (FINALIZADA ou CANCELADA).
	 */
	async updateOrderStatus(
		id: string,
		status: "FINALIZADA" | "CANCELADA",
	): Promise<SellerOrderResponse> {
		const response = await api.patch<SellerOrderResponse>(
			`/vendas/${id}/status`,
			{ status },
		);
		return response.data;
	},
};
