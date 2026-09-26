import { api } from "@/lib/api";
import type {
	CreateProductData,
	DeleteProductResponse,
	Product,
	ToggleActiveResponse,
	UpdateProductData,
} from "@/types";

export const sellerProductsService = {
	async getSellerProducts(): Promise<Product[]> {
		const response = await api.get<Product[]>("/vendedor/produtos");
		return response.data;
	},

	async createProduct(data: CreateProductData): Promise<Product> {
		const response = await api.post<Product>("/vendedor/produtos", data);
		return response.data;
	},

	async updateProduct(id: string, data: UpdateProductData): Promise<Product> {
		const response = await api.put<Product>(`/vendedor/produtos/${id}`, data);
		return response.data;
	},

	async toggleActive(id: string): Promise<ToggleActiveResponse> {
		const response = await api.patch<ToggleActiveResponse>(
			`/vendedor/produtos/${id}/toggle-ativo`,
		);
		return response.data;
	},

	async deleteProduct(id: string): Promise<DeleteProductResponse> {
		const response = await api.delete<DeleteProductResponse>(
			`/vendedor/produtos/${id}`,
		);
		return response.data;
	},
};
