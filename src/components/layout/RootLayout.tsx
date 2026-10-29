import { useEffect } from "react";
import { Outlet } from "react-router";
import { useAuthStore, useCartStore, useChatStore } from "@/stores";
import { Footer } from "./Footer";
import { Header } from "./Header";

export default function RootLayout() {
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const checkAuth = useAuthStore((s) => s.checkAuth);
	const fetchCart = useCartStore((s) => s.fetchCart);
	const connectChat = useChatStore((s) => s.connect);
	const disconnectChat = useChatStore((s) => s.disconnect);

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
			connectChat();
		} else {
			disconnectChat();
		}
	}, [isAuthenticated, connectChat, disconnectChat]);

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
