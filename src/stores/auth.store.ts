import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";

interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	setAuth: (user: User, token: string) => void;
	setUser: (user: User) => void;
	logout: () => void;
}

export const useAuthStore = create<AuthState>()(
	persist(
		(set) => ({
			user: null,
			token: null,
			isAuthenticated: false,
			isLoading: false,

			setAuth: (user, token) =>
				set({
					user,
					token,
					isAuthenticated: true,
					isLoading: false,
				}),

			setUser: (user) =>
				set((state) => ({
					user,
					isAuthenticated: !!state.token,
				})),

			logout: () =>
				set({
					user: null,
					token: null,
					isAuthenticated: false,
					isLoading: false,
				}),
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
