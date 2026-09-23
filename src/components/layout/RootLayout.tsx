import { Outlet } from "react-router";
import { Footer } from "./Footer";
import { Header } from "./Header";

export default function RootLayout() {
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
