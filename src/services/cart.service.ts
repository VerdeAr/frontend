import { api } from "@/lib/api";
import type {
	AddCartItemData,
	CartResponse,
	DeliveryType,
	UpdateCartItemData,
} from "@/types";

export const cartService = {
	async getCart(): Promise<CartResponse> {
		const response = await api.get<CartResponse>("/carrinho");
		return response.data;
	},

	async addItem(data: AddCartItemData): Promise<CartResponse> {
		const response = await api.post<CartResponse>("/carrinho/itens", data);
		return response.data;
	},

	async updateQuantity(
		itemId: string,
		data: UpdateCartItemData,
	): Promise<CartResponse> {
		const response = await api.patch<CartResponse>(
			`/carrinho/itens/${itemId}`,
			data,
		);
		return response.data;
	},

	async removeItem(itemId: string): Promise<CartResponse> {
		const response = await api.delete<CartResponse>(
			`/carrinho/itens/${itemId}`,
		);
		return response.data;
	},

	async clearCart(): Promise<CartResponse> {
		const response = await api.delete<CartResponse>("/carrinho");
		return response.data;
	},

	async setDeliveryType(deliveryType: DeliveryType): Promise<CartResponse> {
		const response = await api.post<CartResponse>("/carrinho/entrega", {
			delivery_type: deliveryType,
		});
		return response.data;
	},

	async setPaymentMethod(paymentMethod: string): Promise<CartResponse> {
		const response = await api.post<CartResponse>("/carrinho/pagamento", {
			payment_method: paymentMethod,
		});
		return response.data;
	},
};
