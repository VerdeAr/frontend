import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";
import { beforeEach, describe, expect, it } from "vitest";
import { useAuthStore } from "@/stores";
import { criarUsuario } from "@/test/fixtures";
import { ProtectedRoute } from "./ProtectedRoute";

// Mostra a rota de origem guardada no state do redirecionamento
function PaginaLogin() {
	const location = useLocation();
	const origem = (location.state as { from?: { pathname: string } } | null)
		?.from?.pathname;
	return <p>Página de login (origem: {origem ?? "nenhuma"})</p>;
}

function renderizar(rotaInicial = "/carrinho") {
	return render(
		<MemoryRouter initialEntries={[rotaInicial]}>
			<Routes>
				<Route path="/login" element={<PaginaLogin />} />
				<Route element={<ProtectedRoute />}>
					<Route path="/carrinho" element={<p>Conteúdo do carrinho</p>} />
				</Route>
				<Route
					path="/com-filhos"
					element={
						<ProtectedRoute>
							<p>Conteúdo com filhos</p>
						</ProtectedRoute>
					}
				/>
			</Routes>
		</MemoryRouter>,
	);
}

beforeEach(() => {
	useAuthStore.setState({
		user: null,
		isAuthenticated: false,
		isLoading: false,
	});
});

describe("ProtectedRoute", () => {
	it("mostra o indicador de carregamento enquanto a sessão é verificada", () => {
		useAuthStore.setState({ isLoading: true });

		const { container } = renderizar();

		expect(screen.queryByText("Conteúdo do carrinho")).not.toBeInTheDocument();
		expect(screen.queryByText(/Página de login/)).not.toBeInTheDocument();
		expect(container.querySelector(".animate-spin")).toBeInTheDocument();
	});

	it("redireciona para o login guardando a página de origem", () => {
		renderizar("/carrinho");

		expect(
			screen.getByText("Página de login (origem: /carrinho)"),
		).toBeInTheDocument();
		expect(screen.queryByText("Conteúdo do carrinho")).not.toBeInTheDocument();
	});

	it("renderiza a rota filha quando o usuário está autenticado", () => {
		useAuthStore.setState({
			user: criarUsuario(),
			isAuthenticated: true,
		});

		renderizar("/carrinho");

		expect(screen.getByText("Conteúdo do carrinho")).toBeInTheDocument();
	});

	it("renderiza os children quando usado como envoltório", () => {
		useAuthStore.setState({
			user: criarUsuario(),
			isAuthenticated: true,
		});

		renderizar("/com-filhos");

		expect(screen.getByText("Conteúdo com filhos")).toBeInTheDocument();
	});
});
