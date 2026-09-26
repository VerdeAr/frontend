import { create } from "zustand";
import { cartService } from "@/services/cart.service";
import type { CartResponse, DeliveryType } from "@/types";

interface CartState {
	cart: CartResponse | null;
	isLoading: boolean;
	isUpdating: boolean;
	isOpen: boolean;
	error: string | null;

	// Ações do Drawer/Gaveta
	openCart: () => void;
	closeCart: () => void;
	toggleCart: () => void;

	// Ações da API do Carrinho
	fetchCart: () => Promise<CartResponse | null>;
	addItem: (productId: string, quantity?: number) => Promise<void>;
	updateQuantity: (itemId: string, quantity: number) => Promise<void>;
	removeItem: (itemId: string) => Promise<void>;
	clearCart: () => Promise<void>;
	setDeliveryType: (deliveryType: DeliveryType) => Promise<void>;
	setPaymentMethod: (paymentMethod: string) => Promise<void>;
	reset: () => void;
}

export const useCartStore = create<CartState>((set) => ({
	cart: null,
	isLoading: false,
	isUpdating: false,
	isOpen: false,
	error: null,

	openCart: () => set({ isOpen: true }),
	closeCart: () => set({ isOpen: false }),
	toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

	fetchCart: async () => {
		try {
			set({ isLoading: true, error: null });
			const cart = await cartService.getCart();
			set({ cart, isLoading: false });
			return cart;
		} catch (err) {
			console.error("Erro ao buscar carrinho:", err);
			set({ isLoading: false, error: "Não foi possível carregar o carrinho." });
			return null;
		}
	},

	addItem: async (productId: string, quantity = 1) => {
		try {
			set({ isUpdating: true, error: null });
			const updatedCart = await cartService.addItem({
				product_id: productId,
				quantity,
			});
			set({ cart: updatedCart, isUpdating: false, isOpen: true });
		} catch (err) {
			console.error("Erro ao adicionar item ao carrinho:", err);
			set({
				isUpdating: false,
				error: "Não foi possível adicionar o produto ao carrinho.",
			});
			throw err;
		}
	},

	updateQuantity: async (itemId: string, quantity: number) => {
		try {
			set({ isUpdating: true, error: null });
			const updatedCart = await cartService.updateQuantity(itemId, {
				quantity,
			});
			set({ cart: updatedCart, isUpdating: false });
		} catch (err) {
			console.error("Erro ao atualizar quantidade do carrinho:", err);
			set({
				isUpdating: false,
				error: "Não foi possível atualizar a quantidade.",
			});
			throw err;
		}
	},

	removeItem: async (itemId: string) => {
		try {
			set({ isUpdating: true, error: null });
			const updatedCart = await cartService.removeItem(itemId);
			set({ cart: updatedCart, isUpdating: false });
		} catch (err) {
			console.error("Erro ao remover item do carrinho:", err);
			set({
				isUpdating: false,
				error: "Não foi possível remover o item do carrinho.",
			});
			throw err;
		}
	},

	clearCart: async () => {
		try {
			set({ isUpdating: true, error: null });
			const updatedCart = await cartService.clearCart();
			set({ cart: updatedCart, isUpdating: false });
		} catch (err) {
			console.error("Erro ao esvaziar carrinho:", err);
			set({
				isUpdating: false,
				error: "Não foi possível esvaziar o carrinho.",
			});
			throw err;
		}
	},

	setDeliveryType: async (deliveryType: DeliveryType) => {
		try {
			set({ isUpdating: true, error: null });
			const updatedCart = await cartService.setDeliveryType(deliveryType);
			set({ cart: updatedCart, isUpdating: false });
		} catch (err) {
			console.error("Erro ao alterar modalidade de entrega:", err);
			set({
				isUpdating: false,
				error: "Não foi possível alterar a modalidade de entrega.",
			});
			throw err;
		}
	},

	setPaymentMethod: async (paymentMethod: string) => {
		try {
			set({ isUpdating: true, error: null });
			const updatedCart = await cartService.setPaymentMethod(paymentMethod);
			set({ cart: updatedCart, isUpdating: false });
		} catch (err) {
			console.error("Erro ao definir forma de pagamento:", err);
			set({
				isUpdating: false,
				error: "Não foi possível salvar a forma de pagamento.",
			});
			throw err;
		}
	},

	reset: () =>
		set({
			cart: null,
			isLoading: false,
			isUpdating: false,
			isOpen: false,
			error: null,
		}),
}));

// ==================== Seletores Atômicos Desacoplados ====================

export const selectCartItems = (state: CartState) => state.cart?.items ?? [];

export const selectCartItemCount = (state: CartState) =>
	state.cart?.total_items ?? 0;

export const selectCartSubtotal = (state: CartState) =>
	state.cart?.subtotal ?? 0;

export const selectCartShipping = (state: CartState) =>
	state.cart?.shipping ?? 0;

export const selectCartTotal = (state: CartState) => state.cart?.total ?? 0;

export const selectDeliveryType = (state: CartState) =>
	state.cart?.delivery_type ?? null;

export const selectPaymentMethod = (state: CartState) =>
	state.cart?.payment_method ?? null;

export const selectIsCartEmpty = (state: CartState) =>
	(state.cart?.items?.length ?? 0) === 0;

export const selectIsCartOpen = (state: CartState) => state.isOpen;
