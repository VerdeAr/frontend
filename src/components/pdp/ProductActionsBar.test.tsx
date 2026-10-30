import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
	ProductActionsBar,
	type ProductActionsBarProps,
} from "./ProductActionsBar";

function renderizar(props: Partial<ProductActionsBarProps> = {}) {
	const onQuantityChange = vi.fn();
	const onAddToCart = vi.fn();

	render(
		<ProductActionsBar
			price={4.5}
			stock={10}
			isActive
			quantity={2}
			onQuantityChange={onQuantityChange}
			onAddToCart={onAddToCart}
			{...props}
		/>,
	);

	return { onQuantityChange, onAddToCart };
}

const diminuir = () =>
	screen.getByRole("button", { name: "Diminuir quantidade" });
const aumentar = () =>
	screen.getByRole("button", { name: "Aumentar quantidade" });

describe("ProductActionsBar", () => {
	it("mostra a quantidade, a unidade e o subtotal calculado", () => {
		renderizar({ quantity: 2, unitSymbol: "kg" });

		expect(screen.getByText("2")).toBeInTheDocument();
		expect(screen.getByText("kg")).toBeInTheDocument();
		// 2 x R$ 4,50 aparece no subtotal e dentro do botão de adicionar
		expect(screen.getAllByText(/9,00/).length).toBeGreaterThan(0);
	});

	it("aumenta e diminui a quantidade em uma unidade", async () => {
		const usuario = userEvent.setup();
		const { onQuantityChange } = renderizar({ quantity: 3 });

		await usuario.click(aumentar());
		expect(onQuantityChange).toHaveBeenLastCalledWith(4);

		await usuario.click(diminuir());
		expect(onQuantityChange).toHaveBeenLastCalledWith(2);
	});

	it("não deixa diminuir abaixo de 1", () => {
		renderizar({ quantity: 1 });

		expect(diminuir()).toBeDisabled();
	});

	it("não deixa aumentar além do estoque", () => {
		renderizar({ quantity: 10, stock: 10 });

		expect(aumentar()).toBeDisabled();
	});

	it("chama onAddToCart ao clicar em adicionar", async () => {
		const usuario = userEvent.setup();
		const { onAddToCart } = renderizar();

		await usuario.click(
			screen.getByRole("button", { name: /Adicionar ao Carrinho/ }),
		);

		expect(onAddToCart).toHaveBeenCalledTimes(1);
	});

	it("mostra produto esgotado e bloqueia tudo quando não há estoque", () => {
		renderizar({ stock: 0, quantity: 1 });

		expect(
			screen.getByRole("button", { name: /Produto Esgotado/ }),
		).toBeDisabled();
		expect(aumentar()).toBeDisabled();
		expect(diminuir()).toBeDisabled();
	});

	it("trata produto inativo como esgotado mesmo com estoque", () => {
		renderizar({ isActive: false, stock: 5 });

		expect(
			screen.getByRole("button", { name: /Produto Esgotado/ }),
		).toBeDisabled();
	});

	it("bloqueia os botões e muda o texto enquanto adiciona", () => {
		renderizar({ isLoading: true });

		expect(screen.getByRole("button", { name: /Adicionando/ })).toBeDisabled();
		expect(aumentar()).toBeDisabled();
		expect(diminuir()).toBeDisabled();
	});
});
