import { api } from "@/lib/api";
import type {
	AuthResponse,
	LoginCredentials,
	RegisterData,
	UpdatePasswordData,
	UpdateProfileData,
	UpdateShippingData,
	User,
} from "@/types";

export const authService = {
	async login(credentials: LoginCredentials): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>("/auth/login", credentials);
		return response.data;
	},

	async register(data: RegisterData): Promise<AuthResponse> {
		const response = await api.post<AuthResponse>("/auth/register", data);
		return response.data;
	},

	async getProfile(): Promise<User> {
		const response = await api.get<User>("/auth/me");
		return response.data;
	},

	async updateProfile(
		data: UpdateProfileData,
	): Promise<{ success: boolean; message: string; user: User }> {
		const response = await api.put<{
			success: boolean;
			message: string;
			user: User;
		}>("/pessoa/perfil", data);
		return response.data;
	},

	async updatePassword(
		data: UpdatePasswordData,
	): Promise<{ success: boolean; message: string }> {
		const response = await api.put<{
			success: boolean;
			message: string;
		}>("/pessoa/senha", data);
		return response.data;
	},

	async updateShipping(data: UpdateShippingData): Promise<{
		success: boolean;
		message: string;
		fixed_shipping_rate: number;
	}> {
		const response = await api.put<{
			success: boolean;
			message: string;
			fixed_shipping_rate: number;
		}>("/pessoa/frete", data);
		return response.data;
	},
};
