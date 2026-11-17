import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, Link, RouterProvider } from "react-router";
import { describe, expect, it } from "vitest";
import NotFoundPage from "./NotFoundPage";

function renderizar(rotaInicial: string) {
	const router = createMemoryRouter(
		[
			{
				path: "/",
				element: (
					<>
						<p>Vitrine</p>
						<Link to="/pagina-que-nao-existe">Link quebrado</Link>
					</>
				),
			},
			{ path: "*", element: <NotFoundPage /> },
		],
		{ initialEntries: [rotaInicial] },
	);
	return render(<RouterProvider router={router} />);
}

describe("NotFoundPage", () => {
	it("mostra o endereço acessado e o link para a vitrine", () => {
		renderizar("/rota/inexistente");

		expect(
			screen.getByRole("heading", { name: "Página não encontrada" }),
		).toBeInTheDocument();
		expect(screen.getByText("/rota/inexistente")).toBeInTheDocument();
		expect(
			screen.getByRole("link", { name: "Voltar para a vitrine" }),
		).toHaveAttribute("href", "/");
	});

	it("não oferece voltar quando a página foi aberta direto pelo endereço", () => {
		renderizar("/rota/inexistente");

		expect(
			screen.queryByRole("button", { name: "Voltar à página anterior" }),
		).not.toBeInTheDocument();
	});

	it("volta para a página anterior quando há histórico", async () => {
		renderizar("/");

		await userEvent.click(screen.getByRole("link", { name: "Link quebrado" }));
		await userEvent.click(
			await screen.findByRole("button", { name: "Voltar à página anterior" }),
		);

		expect(await screen.findByText("Vitrine")).toBeInTheDocument();
	});
});
