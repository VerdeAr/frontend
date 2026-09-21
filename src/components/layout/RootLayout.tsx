import { Outlet } from "react-router";

export default function RootLayout() {
	return (
		<>
			<header>Header</header>
			<main>
				<Outlet />
			</main>
			<footer>Footer</footer>
		</>
	);
}
