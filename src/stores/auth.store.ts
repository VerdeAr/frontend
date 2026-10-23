import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setOnUnauthorizedCallback } from "@/lib/api";
import { authService } from "@/services/auth.service";
import type {
	AuthResponse,
	LoginCredentials,
	RegisterData,
	User,
} from "@/types";

interface AuthState {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setAuth: (user: User) => void;
	clearAuth: () => void;
	setUser: (user: User) => void;
	setLoading: (isLoading: boolean) => void;
	login: (credentials: LoginCredentials) => Promise<AuthResponse>;
	register: (data: RegisterData) => Promise<AuthResponse>;
	logout: () => Promise<void>;
	fetchProfile: () => Promise<User | null>;
	checkAuth: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			isAuthenticated: false,
			isLoading: true,

			setAuth: (user) => {
				set({
					user,
					isAuthenticated: true,
					isLoading: false,
				});
			},

			clearAuth: () => {
				set({
					user: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			setUser: (user) =>
				set({
					user,
					isAuthenticated: true,
				}),

			setLoading: (isLoading) => set({ isLoading }),

			login: async (credentials) => {
				set({ isLoading: true });
				try {
					const data = await authService.login(credentials);
					get().setAuth(data.user);
					return data;
				} catch (error) {
					set({ isLoading: false });
					throw error;
				}
			},

			register: async (registerData) => {
				set({ isLoading: true });
				try {
					const data = await authService.register(registerData);
					get().setAuth(data.user);
					return data;
				} catch (error) {
					set({ isLoading: false });
					throw error;
				}
			},

			logout: async () => {
				set({ isLoading: true });
				try {
					await authService.logout();
					get().clearAuth();
				} catch (error) {
					set({ isLoading: false });
					throw error;
				}
			},

			fetchProfile: async () => {
				try {
					const user = await authService.getProfile();
					set({ user, isAuthenticated: true });
					return user;
				} catch {
					return null;
				}
			},

			checkAuth: async () => {
				set({ isLoading: true });
				try {
					const user = await authService.getProfile();
					set({ user, isAuthenticated: true, isLoading: false });
					return user;
				} catch {
					get().clearAuth();
					return null;
				}
			},
		}),
		{
			name: "@verdear/auth",
			partialize: (state) => ({
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

// Register 401 automatic logout callback with Axios
setOnUnauthorizedCallback(() => {
	useAuthStore.getState().clearAuth();
});
