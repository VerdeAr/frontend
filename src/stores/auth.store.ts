import { Cookies } from "react-cookie";
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

const cookies = new Cookies();

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setAuth: (user: User, token: string) => void;
	setUser: (user: User) => void;
	setLoading: (isLoading: boolean) => void;
	login: (credentials: LoginCredentials) => Promise<AuthResponse>;
	register: (data: RegisterData) => Promise<AuthResponse>;
	logout: () => void;
	fetchProfile: () => Promise<User | null>;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set, get) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,

			setAuth: (user, token) => {
				cookies.set("token", token, {
					path: "/",
					maxAge: 7 * 24 * 60 * 60,
					sameSite: "lax",
				});
				set({
					user,
					token,
					isAuthenticated: true,
					isLoading: false,
				});
			},

			setUser: (user) =>
				set((state) => ({
					user,
					isAuthenticated: !!state.token,
				})),

			setLoading: (isLoading) => set({ isLoading }),

			login: async (credentials) => {
				set({ isLoading: true });
				try {
					const data = await authService.login(credentials);
					get().setAuth(data.user, data.token);
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
					get().setAuth(data.user, data.token);
					return data;
				} catch (error) {
					set({ isLoading: false });
					throw error;
				}
			},

			logout: () => {
				cookies.remove("token", { path: "/" });
				set({
					user: null,
					token: null,
					isAuthenticated: false,
					isLoading: false,
				});
			},

			fetchProfile: async () => {
				if (!get().token) return null;
				try {
					const user = await authService.getProfile();
					set({ user });
					return user;
				} catch {
					return null;
				}
			},
		}),
		{
			name: "@verdear/auth",
			partialize: (state) => ({
				token: state.token,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		},
	),
);

// Register 401 automatic logout callback with Axios
setOnUnauthorizedCallback(() => {
	useAuthStore.getState().logout();
});
