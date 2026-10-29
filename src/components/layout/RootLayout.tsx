import { useEffect } from "react";
import { Outlet } from "react-router";
import { socketService } from "@/services/socket.service";
import { useAuthStore, useCartStore, useChatStore } from "@/stores";
import { Footer } from "./Footer";
import { Header } from "./Header";

export default function RootLayout() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const checkAuth = useAuthStore((s) => s.checkAuth);
	const fetchCart = useCartStore((s) => s.fetchCart);
	const bindRealtime = useChatStore((s) => s.bindRealtime);
	const resetChat = useChatStore((s) => s.reset);

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	useEffect(() => {
		if (isAuthenticated) {
			fetchCart();
		}
	}, [isAuthenticated, fetchCart]);

	// O chat acompanha a sessão: conecta ao entrar e desconecta no logout ou no 401
	useEffect(() => {
		if (isAuthenticated) {
			bindRealtime();
			socketService.connect();
		} else {
			socketService.disconnect();
			resetChat();
		}
	}, [isAuthenticated, bindRealtime, resetChat]);

	return (
		<div className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
			<Header />
			<main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
