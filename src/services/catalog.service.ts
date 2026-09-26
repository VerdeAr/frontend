import { api } from "@/lib/api";
import type {
	Category,
	MeasurementUnit,
	PaginatedProductsResponse,
	Product,
	ProductFilterParams,
} from "@/types";

export const catalogService = {
	async getProducts(
		params?: ProductFilterParams,
	): Promise<PaginatedProductsResponse> {
		const response = await api.get<PaginatedProductsResponse>("/produtos", {
			params,
		});
		return response.data;
	},

	async getProductById(id: string): Promise<Product> {
		const response = await api.get<Product>(`/produtos/${id}`);
		return response.data;
	},

	async getCategories(): Promise<Category[]> {
		const response = await api.get<Category[]>("/categorias");
		return response.data;
	},

	async getMeasurementUnits(): Promise<MeasurementUnit[]> {
		const response = await api.get<MeasurementUnit[]>("/unidades-medida");
		return response.data;
	},
};
