import { api } from "@/lib/api";
import type { Neighborhood } from "@/types";

export const neighborhoodService = {
	async getAll(): Promise<Neighborhood[]> {
		const response = await api.get<Neighborhood[]>("/bairros");
		return response.data;
	},
};
