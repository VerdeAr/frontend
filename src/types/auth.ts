import type { User, UserRole } from "./models";

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterData {
	name: string;
	email: string;
	password: string;
	cpf: string;
	role: UserRole;
	phone?: string | null;
	address?: string | null;
	neighborhood_id?: string | null;
	description?: string | null;
	cnpj?: string | null;
	farm_name?: string | null;
}

export interface AuthResponse {
	token: string;
	user: User;
}

export interface UpdateProfileData {
	name?: string;
	phone?: string | null;
	address?: string | null;
	neighborhood_id?: string | null;
	description?: string | null;
	farm_name?: string | null;
}

export interface UpdatePasswordData {
	current_password: string;
	new_password: string;
	confirm_password: string;
}

export interface UpdateShippingData {
	fixed_shipping_rate: number;
}
