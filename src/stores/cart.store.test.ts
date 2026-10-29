import { beforeEach, describe, expect, it, vi } from "vitest";
import { cartService } from "@/services/cart.service";
import { criarCarrinho, criarCarrinhoComItem } from "@/test/fixtures";
import {
	selectCartItemCount,
	selectCartItems,
	selectCartShipping,
	selectCartSubtotal,
	selectCartTotal,
	selectDeliveryType,
	selectIsCartEmpty,
	selectIsCartOpen,
	selectPaymentMethod,
	useCartStore,
} from "./cart.store";

vi.mock("@/services/cart.service", () => ({
	cartService: {
		getCart: vi.fn(),
		addItem: vi.fn(),
		updateQuantity: vi.fn(),
		removeItem: vi.fn(),
		clearCart: vi.fn(),
		setDeliveryType: vi.fn(),
		setPaymentMethod: vi.fn(),
	},
}));

const servico = vi.mocked(cartService);

beforeEach(() => {
	useCartStore.getState().reset();
	vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("cart.store: carregar o carrinho", () => {
	it("fetchCart guarda o carrinho devolvido pela API", async () => {
		const carrinho = criarCarrinhoComItem();
		servico.getCart.mockResolvedValue(carrinho);

		const resultado = await useCartStore.getState().fetchCart();

		const estado = useCartStore.getState();
		expect(resultado).toEqual(carrinho);
		expect(estado.cart).toEqual(carrinho);
		expect(estado.isLoading).toBe(false);
		expect(estado.error).toBeNull();
	});

	it("fetchCart registra uma mensagem de erro e devolve null quando a API falha", async () => {
		servico.getCart.mockRejectedValue(new Error("Falha de rede"));

		const resultado = await useCartStore.getState().fetchCart();

		const estado = useCartStore.getState();
		expect(resultado).toBeNull();
		expect(estado.cart).toBeNull();
		expect(estado.isLoading).toBe(false);
		expect(estado.error).toBe("Não foi possível carregar o carrinho.");
	});
});

describe("cart.store: alterar o carrinho", () => {
	it("addItem envia a quantidade, atualiza o carrinho e abre a gaveta", async () => {
		const carrinho = criarCarrinhoComItem();
		servico.addItem.mockResolvedValue(carrinho);

		await useCartStore.getState().addItem("produto-1", 2);

		const estado = useCartStore.getState();
		expect(servico.addItem).toHaveBeenCalledWith({
			product_id: "produto-1",
			quantity: 2,
		});
		expect(estado.cart).toEqual(carrinho);
		expect(estado.isOpen).toBe(true);
		expect(estado.isUpdating).toBe(false);
	});

	it("addItem usa a quantidade 1 por padrão", async () => {
		servico.addItem.mockResolvedValue(criarCarrinhoComItem());

		await useCartStore.getState().addItem("produto-1");

		expect(servico.addItem).toHaveBeenCalledWith({
			product_id: "produto-1",
			quantity: 1,
		});
	});

	it("addItem com falha repassa o erro e guarda a mensagem", async () => {
		servico.addItem.mockRejectedValue(new Error("Estoque insuficiente"));

		await expect(useCartStore.getState().addItem("produto-1")).rejects.toThrow(
			"Estoque insuficiente",
		);

		const estado = useCartStore.getState();
		expect(estado.isUpdating).toBe(false);
		expect(estado.error).toBe(
			"Não foi possível adicionar o produto ao carrinho.",
		);
	});

	it("updateQuantity, removeItem e clearCart substituem o carrinho pelo da API", async () => {
		const aposAtualizar = criarCarrinhoComItem({ total_items: 5 });
		servico.updateQuantity.mockResolvedValue(aposAtualizar);
		await useCartStore.getState().updateQuantity("item-1", 5);
		expect(servico.updateQuantity).toHaveBeenCalledWith("item-1", {
			quantity: 5,
		});
		expect(useCartStore.getState().cart?.total_items).toBe(5);

		servico.removeItem.mockResolvedValue(criarCarrinho());
		await useCartStore.getState().removeItem("item-1");
		expect(servico.removeItem).toHaveBeenCalledWith("item-1");
		expect(useCartStore.getState().cart?.items).toHaveLength(0);

		servico.clearCart.mockResolvedValue(criarCarrinho());
		await useCartStore.getState().clearCart();
		expect(servico.clearCart).toHaveBeenCalledTimes(1);
	});

	it("updateQuantity com falha repassa o erro", async () => {
		servico.updateQuantity.mockRejectedValue(new Error("Item inexistente"));

		await expect(
			useCartStore.getState().updateQuantity("item-x", 1),
		).rejects.toThrow("Item inexistente");

		expect(useCartStore.getState().error).toBe(
			"Não foi possível atualizar a quantidade.",
		);
	});

	it("setDeliveryType e setPaymentMethod guardam o carrinho recalculado", async () => {
		servico.setDeliveryType.mockResolvedValue(
			criarCarrinhoComItem({ delivery_type: "RETIRADA", shipping: 0 }),
		);
		await useCartStore.getState().setDeliveryType("RETIRADA");
		expect(servico.setDeliveryType).toHaveBeenCalledWith("RETIRADA");
		expect(useCartStore.getState().cart?.shipping).toBe(0);

		servico.setPaymentMethod.mockResolvedValue(
			criarCarrinhoComItem({ payment_method: "Dinheiro" }),
		);
		await useCartStore.getState().setPaymentMethod("Dinheiro");
		expect(servico.setPaymentMethod).toHaveBeenCalledWith("Dinheiro");
		expect(useCartStore.getState().cart?.payment_method).toBe("Dinheiro");
	});
});

describe("cart.store: gaveta e reset", () => {
	it("abre, fecha e alterna a gaveta do carrinho", () => {
		const { openCart, closeCart, toggleCart } = useCartStore.getState();

		openCart();
		expect(useCartStore.getState().isOpen).toBe(true);
		closeCart();
		expect(useCartStore.getState().isOpen).toBe(false);
		toggleCart();
		expect(useCartStore.getState().isOpen).toBe(true);
	});

	it("reset volta ao estado inicial", () => {
		useCartStore.setState({
			cart: criarCarrinhoComItem(),
			isOpen: true,
			error: "algum erro",
		});

		useCartStore.getState().reset();

		const estado = useCartStore.getState();
		expect(estado.cart).toBeNull();
		expect(estado.isOpen).toBe(false);
		expect(estado.error).toBeNull();
	});
});

describe("cart.store: seletores", () => {
	it("devolvem valores seguros quando ainda não há carrinho", () => {
		const estado = useCartStore.getState();

		expect(selectCartItems(estado)).toEqual([]);
		expect(selectCartItemCount(estado)).toBe(0);
		expect(selectCartSubtotal(estado)).toBe(0);
		expect(selectCartShipping(estado)).toBe(0);
		expect(selectCartTotal(estado)).toBe(0);
		expect(selectDeliveryType(estado)).toBeNull();
		expect(selectPaymentMethod(estado)).toBeNull();
		expect(selectIsCartEmpty(estado)).toBe(true);
		expect(selectIsCartOpen(estado)).toBe(false);
	});

	it("leem os valores calculados pela API", () => {
		useCartStore.setState({ cart: criarCarrinhoComItem(), isOpen: true });
		const estado = useCartStore.getState();

		expect(selectCartItems(estado)).toHaveLength(1);
		expect(selectCartItemCount(estado)).toBe(2);
		expect(selectCartSubtotal(estado)).toBe(9);
		expect(selectCartShipping(estado)).toBe(12.5);
		expect(selectCartTotal(estado)).toBe(21.5);
		expect(selectDeliveryType(estado)).toBe("ENTREGA");
		expect(selectPaymentMethod(estado)).toBe("PIX");
		expect(selectIsCartEmpty(estado)).toBe(false);
		expect(selectIsCartOpen(estado)).toBe(true);
	});
});
