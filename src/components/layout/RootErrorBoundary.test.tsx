import { render, screen } from "@testing-library/react";
import { createMemoryRouter, data, RouterProvider } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import RootErrorBoundary from "./RootErrorBoundary";

// Monta uma árvore mínima em que o loader da rota falha com o erro informado
function renderizarComFalha(falha: () => never) {
	const router = createMemoryRouter(
		[
			{
				path: "/",
				element: <p>Conteúdo da página</p>,
				errorElement: <RootErrorBoundary />,
				loader: () => falha(),
			},
		],
		{ initialEntries: ["/"] },
	);
	return render(<RouterProvider router={router} />);
}

function lancarStatus(status: number): () => never {
	return () => {
		throw data(null, { status, statusText: "Texto técnico" });
	};
}

let consoleError: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("RootErrorBoundary", () => {
	it("mostra página não encontrada para 404, sem recarregar", async () => {
		renderizarComFalha(lancarStatus(404));

		expect(
			await screen.findByRole("heading", { name: "Página não encontrada" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Voltar para o Início" }),
		).toHaveAttribute("href", "/");
		expect(
			screen.queryByRole("button", { name: "Recarregar Página" }),
		).not.toBeInTheDocument();
	});

	it("oferece entrar na conta quando a sessão expirou (401)", async () => {
		renderizarComFalha(lancarStatus(401));

		expect(
			await screen.findByRole("heading", { name: "Sua sessão expirou" }),
		).toBeInTheDocument();
		expect(screen.getByRole("link", { name: "Entrar" })).toHaveAttribute(
			"href",
			"/login",
		);
	});

	it("diferencia falta de permissão (403) de sessão expirada", async () => {
		renderizarComFalha(lancarStatus(403));

		expect(
			await screen.findByRole("heading", { name: "Acesso não permitido" }),
		).toBeInTheDocument();
		expect(
			screen.queryByRole("link", { name: "Entrar" }),
		).not.toBeInTheDocument();
	});

	it("permite recarregar em falha do servidor (500)", async () => {
		renderizarComFalha(lancarStatus(500));

		expect(
			await screen.findByRole("heading", { name: "Serviço indisponível" }),
		).toBeInTheDocument();
		expect(
			screen.getByRole("button", { name: "Recarregar Página" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/Texto técnico/)).not.toBeInTheDocument();
	});

	it("esconde a mensagem técnica de uma exceção e a registra no console", async () => {
		const erro = new Error("Cannot read properties of undefined");
		renderizarComFalha(() => {
			throw erro;
		});

		expect(
			await screen.findByRole("heading", { name: "Ops! Algo deu errado" }),
		).toBeInTheDocument();
		expect(screen.queryByText(/Cannot read/)).not.toBeInTheDocument();
		expect(consoleError).toHaveBeenCalledWith(
			"Erro capturado pelo RootErrorBoundary:",
			erro,
		);
	});
});
