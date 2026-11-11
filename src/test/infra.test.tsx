import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "@/components/ui/button";

describe("infraestrutura de testes", () => {
	it("renderiza um componente com o alias @ e jest-dom", () => {
		render(<Button>Entrar</Button>);

		expect(screen.getByRole("button", { name: "Entrar" })).toBeInTheDocument();
	});

	it("simula a interação do usuário", async () => {
		const aoClicar = vi.fn();
		render(<Button onClick={aoClicar}>Salvar</Button>);

		await userEvent.click(screen.getByRole("button", { name: "Salvar" }));

		expect(aoClicar).toHaveBeenCalledTimes(1);
	});
});
