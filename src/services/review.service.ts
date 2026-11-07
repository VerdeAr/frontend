import { api } from "@/lib/api";
import type { CreateReviewPayload, FormattedReviewItem, Review } from "@/types";

export const reviewService = {
	/**
	 * Submete a avaliação de uma compra concluída pelo cliente autenticado.
	 * Regras de negócio (RF-60 e RF-61): nota de 1 a 5, comentário opcional de até 500 caracteres,
	 * apenas compras FINALIZADAS e apenas uma avaliação por compra.
	 */
	async createReview(payload: CreateReviewPayload): Promise<Review> {
		const response = await api.post<Review>("/avaliacoes", payload);
		return response.data;
	},

	/**
	 * Busca todas as avaliações recebidas por um produto específico.
	 */
	async getReviewsByProduct(productId: string): Promise<FormattedReviewItem[]> {
		const response = await api.get<FormattedReviewItem[]>(
			`/avaliacoes/produto/${productId}`,
		);
		return response.data;
	},

	/**
	 * Busca todas as avaliações recebidas pelos produtos de um produtor/vendedor.
	 */
	async getReviewsBySeller(sellerId: string): Promise<FormattedReviewItem[]> {
		const response = await api.get<FormattedReviewItem[]>(
			`/avaliacoes/vendedor/${sellerId}`,
		);
		return response.data;
	},
};
