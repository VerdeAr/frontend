import type { Product } from "./models";

export interface ProductFilterParams {
	categoriaId?: string;
	category_id?: string;
	vendedorId?: string;
	seller_id?: string;
	termo?: string;
	search?: string;
	q?: string;
	disponivel?: boolean;
	page?: number;
	limit?: number;
	orderBy?: "name" | "price" | "created_at";
	orderDir?: "ASC" | "DESC";
}

export interface PaginatedProductsResponse {
	data: Product[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
}

export interface CreateProductData {
	name: string;
	price: number;
	stock: number;
	category_id?: string | null;
	measurement_unit_id?: string | null;
	description?: string | null;
	image_url?: string | null;
	is_active?: boolean;
}

export interface UpdateProductData {
	name?: string;
	price?: number;
	stock?: number;
	category_id?: string | null;
	measurement_unit_id?: string | null;
	description?: string | null;
	image_url?: string | null;
	is_active?: boolean;
}

export interface ToggleActiveResponse {
	id: string;
	is_active: boolean;
	message: string;
}

export interface DeleteProductResponse {
	message: string;
}
